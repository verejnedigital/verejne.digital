from collections import defaultdict

from utils import download_cadastral_json, download_cadastral_pages, search_string, WGS84_to_Mercator, json_dump_utf8

CADASTRAL_API_ODATA = 'https://kataster.skgeodesy.sk/PortalOData/'
DIR_OUTPUT = '/tmp/skgeodesy/'


def get_cadastral_data_for_coordinates(lat, lon, tolerance, circumvent_geoblocking, verbose):
    """ Identifies the parcel(s) at given (longitude, latitude) coordinates
    (with a given tolerance) and returns a list of owners, grouped by folio.
    """

    # Convert to Mercator (EPSG:3857)
    X, Y = WGS84_to_Mercator(lat, lon)
    Xmin, Ymin = WGS84_to_Mercator(lat-tolerance, lon-tolerance)
    Xmax, Ymax = WGS84_to_Mercator(lat+tolerance, lon+tolerance)
    if verbose:
        print('Mercator coordinates: (%.9f | %.9f)' % (X, Y))

    # Identify object(s) at/around Mercator coordinates (X, Y)
    # Note: The mapExtent and imageDisplay arguments of the identify API are required,
    #       but currently set to some fixed values. Based on the documentation
    #       this should be fine and actually seems to work all right, but it is odd.
    url = ('https://kataster.skgeodesy.sk/eskn/rest/services/VRM/identify/MapServer/identify?'
           'f=json&'
           #'geometryType=esriGeometryPoint&'
           #'geometry=%7B%22x%22%3A' + ('%.9f' % (X)) + '%2C%22y%22%3A' + ('%.9f' % (Y)) + '%7D&'
           #'geometry=' + ('%.9f' % (X)) + ',' + ('%.9f' % (Y)) + '&'
           'geometryType=esriGeometryEnvelope&'
           'geometry=' + ('%.9f' % (Xmin)) + ',' + ('%.9f' % (Ymin)) + ',' + ('%.9f' % (Xmax)) + ',' + ('%.9f' % (Ymax)) + '&'
           'sr=3857&'
           'layers=all&'  # try using all instead of 1 if does not work
           'time=&layerTimeOptions=&layerdefs=&tolerance=0&'
           'mapExtent=1902836.4433083886%2C6131302.14771959%2C1902310.3415745723%2C6130808.890021369&'
           'imageDisplay=881%2C826%2C96&'
           'returnGeometry=false&'
           'maxAllowableOffset=')
    json_data = download_cadastral_json(url, circumvent_geoblocking, verbose)
    if json_data is None:
        return None
    
    # Check result is available
    results = [r for r in json_data['results'] if 'PARCELS' in r['layerName']]
    if len(results) == 0:
        print('No object has been found at provided coordinates')
        return
    if verbose:
        for result in results:
            print('%d | %s | %s | %s' % (result['layerId'], result['layerName'], result['displayFieldName'], result['value']))

    # Parse results into set of pairs (parcel_type, parcel_ID), where parcel_type = {C, E}
    parcels = set([(r['layerName'][-1], r['attributes']['ID']) for r in results])

    # Initialize storage for downloaded Subjects and Folios
    FoliosById = {}
    SubjectById = {}
    FolioSubjectIds = defaultdict(set)
    FolioParcelNos = defaultdict(list)

    # Download parsed Parcels
    for parcel_type, ParcelId in parcels:
        if verbose:
            print('Downloading Parcel%c(%s)...' % (parcel_type, ParcelId))

        url_parcel = CADASTRAL_API_ODATA + 'Parcels' + parcel_type + '(' + ParcelId + ')/'
        
        # Download parcel metadata
        url = url_parcel + '?$select=Id,ValidTo,No,Area,HouseNo,Extent&$expand=OwnershipType($select=Name,Code),CadastralUnit($select=Name,Code),Localization($select=Name),Municipality($select=Name),LandUse($select=Name),SharedProperty($select=Name),ProtectedProperty($select=Name),Affiliation($select=Name),Folio($select=Id,No),Utilisation($select=Name),Status($select=Code)'
        Parcel = download_cadastral_json(url, circumvent_geoblocking, verbose)
        if Parcel is None:
            continue
        # Skip Parcels without a Folio (and hence without OwnershipRecords)
        if Parcel['Folio'] is None:
            continue

        # Save Folio, with constructed URL
        FolioId = Parcel['Folio']['Id']
        FoliosById[FolioId] = {
            'No': Parcel['Folio']['No'],
            'URL': 'https://kataster.skgeodesy.sk/EsknBo/Bo.svc/GeneratePrf?prfNumber=%s&cadastralUnitCode=%s&outputType=html' % (Parcel['Folio']['No'], Parcel['CadastralUnit']['Code'])
        }
        FolioParcelNos[FolioId].append(Parcel['No'])

        # Log downloaded Parcel
        if verbose:
            print('LandUse:\n  %s' % (Parcel['LandUse']['Name']))
            print('Utilisation:\n  %s' % (Parcel['Utilisation']['Name']))
            print('Area:\n  %s' % (Parcel['Area']))
        path_output = '%sParcel%s(%s).json' % (DIR_OUTPUT, parcel_type, ParcelId)
        json_dump_utf8(Parcel, path_output)

        # Accumulate owners from all pages
        url = url_parcel + 'Kn.Participants?$select=Id,Name&$expand=Subjects($select=Id,FirstName,Surname,BirthSurname;$expand=Address($select=Id,Street,HouseNo,Municipality,Zip,State))'
        Participants = download_cadastral_pages(url, circumvent_geoblocking, verbose)
        for Participant in Participants:
            for Subject in Participant['Subjects']:
                SubjectById[Subject['Id']] = Subject
                FolioSubjectIds[FolioId].add(Subject['Id'])
                if verbose:
                    Address = Subject['Address']
                    print('  %s | %s | %s | %s | %s | %s | %s' % (Subject['Surname'], Subject['FirstName'], Address['Street'], Address['HouseNo'], Address['Municipality'], Address['Zip'], Address['State']))

    # Add Subjects and ParcelNos to the the Folios
    for FolioId in FolioSubjectIds:
        SubjectIds = FolioSubjectIds[FolioId]
        FoliosById[FolioId]['Subjects'] = [SubjectById[SubjectId] for SubjectId in SubjectIds]
        FoliosById[FolioId]['ParcelNos'] = FolioParcelNos[FolioId]

    # Construct response
    return {
        'lat': lat, 'lon': lon,
        'X': X, 'Y': Y,
        'Folios': [FoliosById[FolioId] for FolioId in FoliosById],
    }

def get_cadastral_data_for_company(company_name, circumvent_geoblocking, verbose):
    # Get Subjects with matching company name
    url = CADASTRAL_API_ODATA + "Subjects/?$filter=FirstNameSearch eq null and SurnameSearch eq '" + search_string(company_name) + "'"
    Subjects = download_cadastral_pages(url, circumvent_geoblocking, verbose)
    if verbose:
        print('Received %d Subjects for company %s' % (len(Subjects), company_name.encode('utf-8')))

    # Accumulate information from all found Subjects
    Folios = {}
    for Si, Subject in enumerate(Subjects):
        url = (CADASTRAL_API_ODATA + 'Subjects(' + str(Subject['Id']) + ')/Participants/?$expand=OwnershipRecord($expand=Folio($expand=CadastralUnit($expand=Municipality)))')
        Participants = download_cadastral_pages(url, circumvent_geoblocking, verbose)
        if verbose:
            print('(%d/%d) Subject(%s) appears in %d Participants' % (Si+1, len(Subjects), Subject['Id'], len(Participants)))
        for Participant in Participants:
            Folio = Participant['OwnershipRecord']['Folio']
            Folios[Folio['Id']] = Folio

    # Translate dictionary into a list of (unique) values
    Folios = [Folios[Id] for Id in Folios]

    # Add Folio URLs
    FolioURL_prefix = 'https://kataster.skgeodesy.sk/EsknBo/Bo.svc/GeneratePrf?'
    for Folio in Folios:
        FolioNo = Folio['No']
        CadastralUnitCode = Folio['CadastralUnit']['Code']
        FolioURL_suffix = 'prfNumber=%s&cadastralUnitCode=%s&outputType=html' % (FolioNo, CadastralUnitCode)
        Folio['URL'] = FolioURL_prefix + FolioURL_suffix

    # Construct and return response
    return {'company_name': company_name, 'Folios': Folios}
