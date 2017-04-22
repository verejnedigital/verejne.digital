// javascript is not our strength. If you'd like to help or have any suggestions how to improve the code, we want to hear from you. Please contact us on facebook.
function SearchComp(searchTextElem, searchStatusElem, searchResultsElem, callback) {
    this.search_responses = {};
    this.searchTextElem = searchTextElem;
    this.searchStatusElem = searchStatusElem;
    this.searchResultsElem = searchResultsElem;
    this.callback = callback;

    this.addResponse = function(eid) {
        var obj = $.parseHTML('<a class="list-group-item list-group-item-danger">' + this.search_responses[eid] +'</a>');
        this.searchResultsElem.appendChild(obj[0]);
            
        if (this.callback != null) {
            var that = this;
            that.callback(eid);
            //$(obj[0]).on('click', function () { that.callback(eid) });
        };
    };
    
    this.clearResponse = function() {
        this.searchResultsElem.innerHTML = '';   
    }
    
    this.getSearchInfo = function(eid) {
        var resultsText;
        var req = serverURL + 'getInfo?eid=' + eid;
        var xmlhttp = new XMLHttpRequest();
        var that = this;
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var jsonData = JSON.parse(xmlhttp.responseText);
                if (jsonData.entities != null && jsonData.entities.length > 0) {
                    jsonData.entities[0].eid = eid;        
                }
                that.search_responses[eid] = displayInfoSearch(jsonData);
                that.addResponse(eid);
            }
        }
        xmlhttp.open("GET", req, true);
        xmlhttp.send();
    }
    
    this.searchEntity = function() {
        var searchText = this.searchTextElem.value; 
        this.searchStatusElem.innerHTML = 'Prebieha hľadanie ...';
        this.clearResponse();
        var req = serverURL + 'searchEntity?text=' + searchText;
        var xmlhttp = new XMLHttpRequest();
       
        var that = this;
    
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {                    
                var jsonData = JSON.parse(xmlhttp.responseText);
                if (that.callback != null) {
                    that.callback(jsonData);
                    that.searchStatusElem.innerHTML = 'Nájdených ' + jsonData.length + ' záznamov pre "' + searchText + '".';
                } else {
                    that.searchStatusElem.innerHTML = 'Zobrazujem ' + jsonData.length + ' výsledkov pre "' + searchText + '".';
                    for (var i=0; i<jsonData.length;i++) {
                        that.getSearchInfo(jsonData[i].eid);                
                    }       
                }         
            }
        }
        xmlhttp.open("GET", req, true);
        xmlhttp.send();
    }
}
