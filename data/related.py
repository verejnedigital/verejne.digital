class Related:
  db = None
  entities = None
  
  def __init__(self, db, entities):
      self.db = db
      self.entities = entities
  
  def addNewRelated(self, eid_from, eid_to, relation_type, distance, effective_from, effective_to):
    print 'Adding ',eid_from,"->",eid_to," (",relation_type," )"
    relation_id = self.db.add_values("Related", [eid_from, eid_to, relation_type, distance, effective_from, effective_to])    
    
  def addRelated(self,org_id, relation_type, ico, name, address_id, effective_from, effective_to):
    eid_from = self.entities.GetEidForOrgId(org_id)
    if eid_from is None:
      print 'org_id ',org_id,' not found'
      return
    eid_to = self.entities.GetEntity(ico, name, address_id)
    self.addNewRelated(eid_from, eid_to, relation_type, 1, effective_from, effective_to)
  
if __name__ == '__main__':
    r=Related()
