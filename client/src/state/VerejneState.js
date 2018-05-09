import {immutableSet} from '../utils'
import {get} from 'lodash'

export const PATH_MAP = ['map']
export const PATH_MAP_OPTIONS = [...PATH_MAP, 'mapOptions']

export const setInitialState = (state) =>
  immutableSet(state, PATH_MAP, {
    mapOptions: {
      center: [48.600, 19.500], // Slovakia :)
      zoom: 8,
      bounds: undefined,
    },
    mapReference: undefined,
    entities: [],
  })

export const mapOptionsSelector = (state) => get(state, PATH_MAP_OPTIONS)
export const centerSelector = (state) => get(state, [...PATH_MAP_OPTIONS, 'center'])
export const zoomSelector = (state) => get(state, [...PATH_MAP_OPTIONS, 'zoom'])
export const mapReferenceSelector = (state) => get(state, [...PATH_MAP, 'mapReference'])
export const entitiesSelector = (state) => get(state, [...PATH_MAP, 'entities'])


export class Entity {
  constructor({eid, lat, lng, title, size, ds, level}) {
    this.eid = eid
    this.lng = lng
    this.lat = lat
    this.selected = false
    this.title = title
    this.size = size
    this.level = level
    this.visible = false
    this.ds = ds
  }
}
