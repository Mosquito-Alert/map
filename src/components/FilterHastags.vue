<!--
  UI FOR HASHTAG FILTERS
  WHEN FILTER CHANGES, EVENT 'tagsModified' IS FIRED.
-->

<template>
  <div class = "hashtags-list">
    <q-input
      v-model="newTag"
      :loading="isFilteringTag"
      color="orange"
      :label="trans('Placeholder hashtag')"
      @keyup.enter="addTag"
    >
    </q-input>
      <div v-if="tags.length">
        <q-chip
          class="hashtag-chip"
          :class="tag.startsWith(':') ? 'report-tag':''"
          square
          removable
          @remove="deleteTag(tag)"
          v-for="tag, index in tags" :key="index">
          {{tag}}
        </q-chip>
      </div>
  </div>
</template>
<script>
import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '../stores/appStore.js'

export default {
  props: [],
  emits: ['tagsModified'],
  setup (props, context) {
    const tags = ref([])
    const newTag = ref()
    const appStore = useAppStore()
    const trans = function (text) {
      return appStore.getText(text)
    }

    // When user cancels a tag
    const deleteTag = function (tag) {
      const index = tags.value.indexOf(tag)
      tags.value.splice(index, 1)
      context.emit('tagsModified', {
        tags: tags.value,
        mode: 'deletedTag',
        tag: tag
      })
    }

    /*
    There are two types of tags. General tags and 'id' tags
    Id tags start with : and are quite unique
    Only tags of same type can sequenced.
    */
    const addTag = function () {
      if (newTag.value.startsWith(':')) {
        appStore.setFilteringTag({ value: true })
        // if all tags start with ':' then push it, otherwise empty array
        const onlyReports = tags.value.every(t => {
          return t.startsWith(':')
        })
        if (!onlyReports) {
          tags.value = []
        }
      } else {
        // If some report_it tag, then reset tags
        const someReports = tags.value.some(t => {
          return t.startsWith(':')
        })
        if (someReports) {
          tags.value = []
        }
        newTag.value = newTag.value.toLowerCase()
      }

      if (!tags.value.includes(newTag.value)) {
        tags.value.push(newTag.value)
      }

      context.emit('tagsModified', {
        tags: tags.value,
        mode: 'addedTag',
        tag: newTag.value
      })

      newTag.value = ''
    }

    // Set tags in UI When loding sharedview
    function setTags (t) {
      tags.value = []
      tags.value.push(...t)
    }

    // Preset default view
    onMounted(function () {
      const defaults = JSON.parse(JSON.stringify(appStore.getDefaults))
      tags.value = defaults.hashtags
    })

    return {
      trans,
      setTags,
      newTag,
      tags,
      deleteTag,
      addTag,
      isFilteringTag: computed(() => appStore.getIsFilteringTag)
    }
  }
}
</script>

<style lang="scss">
.hashtags-list label{
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
}
.q-field__marginal{
  height:unset;
}
.q-chip{
  background: $primary-color;
  margin-left:0px;
}
.q-chip__icon {
  color: unset;
}
.hashtags-list .hashtag-chip,
.hashtags-list .hashtag-chip .q-chip__icon--remove {
  color: white;
  opacity: 1;
}
.q-chip.report-tag{
  background-color: $filter-grey;
}
</style>
