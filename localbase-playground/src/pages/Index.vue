<template>
  <q-page class="q-pa-md">

    <q-banner class="bg-grey-3 q-pa-lg constrain">
      <p class="text-body1">
        Welcome to Localbase Playground! 
      </p>
      <p class="text-body1">
        To get started, open up your <b>Chrome Devtools</b> and go to <b>Application</b> > <b>IndexedDB</b>. Make sure you can see your console too. 
      </p>
      <p class="text-body1">
        Then, start running code snippets! I'd recommend first running them all one-by-one from top left to bottom. Then, try editing code snippets!
      </p>
      <p class="text-body1">
        After running a code snippet, click on <b>IndexedDB</b> > <b>db</b> > <b>users</b> to see how the data looks.
      </p>
      <p class="text-body1">
        Whenever Localbase makes a change, you need to click the Refresh button at the top of the <b>IndexedDB</b> > <b>db</b> > <b>users</b> panel.
      </p>
      <p class="text-body1">
        Also, watch the console for logs! Enjoy!
      </p>
    </q-banner>

    <div
      v-for="codeSnippetSection in codeSnippetSections"
      :key="codeSnippetSection.sectionTitle"
    >
      <h4>{{ codeSnippetSection.sectionTitle }}</h4>

      <div class="row q-mb-lg q-col-gutter-md">
        <div
          v-for="codeSnippet in codeSnippetSection.codeSnippets"
          :key="codeSnippet.title"
          class="col-12 col-md-6 col-lg-4 col-xl-3"
          :class="{ 'animated pulse infinite' : codeSnippetActive == codeSnippet.id }"
        >
          <q-card
            bordered
            flat
          >
            <q-item-section class="bg-primary text-white">
              <div
                class="text-h5 q-mt-sm q-mb-xs q-px-md q-py-xs"
              >
                {{ codeSnippet.title }}
              </div>
            </q-item-section>

            <q-separator />

            <q-card-section class="q-pa-md horizontal">
              <prism-editor
                v-model="codeSnippet.code"
                language="js"
              />
              <!-- <q-input
                v-model="codeSnippet.code"
                class="col text-code"
                filled
                type="textarea"
                autogrow
              /> -->
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                @click="runCode(codeSnippet.code, codeSnippet.id, true)"
                color="primary"
                icon-right="play_arrow"
                :disable="codeSnippetActive !== null"
              >
                Run Code
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>

    <h4>Run all Code Snippets</h4>
    <div class="row q-mb-lg">
      <span class="text-subtitle1 q-mr-md q-mt-xs">Run all Code Snippets with a </span>
      <q-input
        v-model="runAllCodeSnippetsDelay"
        dense
        outlined
      />
      <span class="text-subtitle1 q-mx-md q-mt-xs">ms pause between each one: </span>
      <q-btn
        @click="runAllCodeSnippets"
        label="Run all code snippets!"
        color="primary"
        icon-right="play_arrow"
        :disable="codeSnippetActive !== null"
      />
    </div>

    <!-- <localbase-editor
      database="db"
      :collections="['users']"
    ></localbase-editor> -->

  </q-page>
</template>

<script>
import codeSnippetSections from 'src/code-snippets'
import Localbase from 'localbase'
import "prismjs"
import "prismjs/themes/prism.css"
import PrismEditor from 'vue-prism-editor'
let db = new Localbase('db')
let otherDb = new Localbase('otherDb')

export default {
  name: 'PageIndex',
  data() {
    return {
      codeSnippetSections: [],
      codeSnippetActive: null,
      runAllCodeSnippetsDelay: 10000
    }
  },
  methods: {
    runCode(code, id, once) {
      eval(code)
      if (once) {
        this.codeSnippetActive = id
        setTimeout(() => {
          this.codeSnippetActive = null
        }, 2000);
      }
    },
    runAllCodeSnippets() {
      // scroll to top
      document.body.scrollIntoView({behavior: 'smooth', block: 'start'});

      // get all code snippets into a single array
      let codeSnippets = []
      this.codeSnippetSections.forEach(codeSnippetSection => {
        codeSnippetSection.codeSnippets.forEach(codeSnippet => {
          let codeSnippetCopy = Object.assign({}, codeSnippet)
          codeSnippets.push(codeSnippet)
        })
      })

      // loop through all code snippets and run code
      let $this = this
      for (var i = 0; i < codeSnippets.length; i++) {
        (function (i) {
          setTimeout(function () {
            console.log(`*** Running Code Snippet: "${ codeSnippets[i].title }" ***`)
            $this.codeSnippetActive = codeSnippets[i].id
            $this.runCode(codeSnippets[i].code)
            if (i === codeSnippets.length - 1) {
              setTimeout(() => {
                console.log(`*** Finished running Code Snippets! ***`)
                $this.codeSnippetActive = null
                $this.$q.notify('Finished running Code Snippets!')
              }, 3000);
            }
          }, $this.runAllCodeSnippetsDelay * i);
        })(i);
      };
    }
  },
  created() {
    this.codeSnippetSections = codeSnippetSections
  },
  components: {
    PrismEditor
  }
}
</script>

<style lang="sass">
  .pulse
    -webkit-animation-duration: 1s !important;
    .q-card
      transition: background 0.3s
      background: lighten($primary, 60)
</style>