<template>
  <div class="lbe">
    <div class="lbe-header lbe-bg-primary lbe-text-white">
      <b>Localbase Editor</b> - {{ database }}
    </div>
    <div class="lbe-panels">

      <!-- collections -->
      <div class="lbe-panel lbe-collections">
        <div class="lbe-panel-header">Collections</div>
        <ul>
          <li
            v-for="collection in collections"
            :key="collection"
            @click="getDocuments(collection)"
          >
            {{ collection }}
          </li>
        </ul>
      </div>

      <!-- documents -->
      <div class="lbe-panel lbe-documents">
        <div class="lbe-panel-header">Documents</div>
        <ul>
          <li
            v-for="documentKey in documents"
            :key="documentKey"
            @click="getFields(documentKey)"
          >
            {{ documentKey }}
          </li>
        </ul>
      </div>

      <!-- fields -->
      <div class="lbe-panel lbe-fields">
        <div class="lbe-panel-header">{{ activeDocument || ' '}}</div>
        <div v-for="(value, property) in fields" :key="property">
          {{ property }}: <input :value="value" @change="editField($event, property)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as localForage from "localforage"

export default {
  props: ['database', 'collections'],
  data() {
    return {
      documents: [],
      activeCollection: null,
      activeDocument: null,
      fields: null
    }
  },
  methods: {
    configureDatabase() {
      localForage.config({
        driver      : localForage.INDEXEDDB,
        name        : this.database
      })
    },
    getDocuments(collection) {
      this.activeCollection = collection
      this.documents = []

      localForage.config({ storeName: collection })

      localForage.iterate((value, key, iterationNumber) => {
        // console.log('[key, value]: ', [key, value])
        this.documents.push(key)
      }).then(result => {

      }).catch(err => {
        // This code runs if there were any errors
        console.log(err);
      });
    },
    getFields(documentKey) {
      this.activeDocument = documentKey
      localForage.getItem(documentKey).then(value => {
        // This code runs once the value has been loaded
        // from the offline store.
        // console.log(value);
        this.fields = value
      }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
      })
    },
    editField($event, property) {
      // get type of current property (number / string / boolean / undefined)
      let fieldType = typeof this.fields[property]
      console.log('fieldType: ', fieldType)

      // convert new value to the right type
      let newValue = $event.target.value
      if (fieldType == 'number') {
        newValue = Number(newValue)
      }
      else if (fieldType == 'boolean') {
        newValue = JSON.parse(newValue)
      }

      // set the new value in our fields data property
      this.fields[property] = newValue

      // update the item in the database
      localForage.setItem(this.activeDocument, this.fields).then(() => {
        console.log('done')
      }).catch(function (err) {
        // we got an error
      });
    }
  },
  mounted() {
    this.configureDatabase()
  }
}
</script>

<style>
  /* colors */
  .lbe-bg-primary {
    background-color: #124F5C;
  }
  .lbe-text-white {
    color: white;
  }

  /* app */
  .lbe {
    width: 100%;
    height: 400px;
    font-size: 14px;
    background: white;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 10000;
    border: 1px solid #eee;
  }
  .lbe-header {
    padding: 5px 10px;
  }
  .lbe-panels {
    display: flex;
    position: relative;
    transform: translateX(0);
    transition: .2s transform cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    width: 100%;
  }
  .lbe-panel {
    flex: 0 0 27%;
    box-sizing: border-box;
    border-right: 1px solid rgba(0,0,0,.12);
    /* display: inline-flex; */
    height: 100%;
    min-height: 524px;
    position: relative;
    white-space: initial;
  }
  .lbe-panel-header {
    background: rgb(250, 250, 250);
    color: rgba(0, 0, 0, 0.7);
    line-height: 44px;
    padding: 0 10px;
    border-bottom: 1px solid rgba(0,0,0,.12);
  }
</style>