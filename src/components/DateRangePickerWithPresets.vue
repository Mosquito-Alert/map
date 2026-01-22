<template>
  <q-input :model-value="formatedDateRange" input-class="cursor-pointer" readonly autogrow borderless label-slot>
    <template v-slot:label>
      {{ $t('date') }}
    </template>
    <template v-slot:after v-if="formatedDateRange">
      <q-btn round outline size='xs' color='grey-6' icon="fa fat fa-xmark"
        @click="$emit('update:modelValue', { 'from': null, 'to': null })"></q-btn>
    </template>
    <template v-slot:default>
      <q-popup-proxy transition-show="scale" transition-hide="scale">
        <div class="row">
          <div class='column q-py-sm'>
            <q-btn flat @click="$emit('update:modelValue', { 'from': new Date(), 'to': new Date() })">
              {{ $t('today') }}
            </q-btn>
            <q-btn flat
              @click="$emit('update:modelValue', { 'from': date.startOfDate(new Date(), 'month'), 'to': new Date() })">
              {{ $t('this_month') }}
            </q-btn>
            <q-btn flat
              @click="$emit('update:modelValue', { 'from': date.startOfDate(new Date(), 'year'), 'to': new Date() })">
              {{ $t('this_year') }}
            </q-btn>
          </div>
          <q-separator vertical />
          <q-date class='no-shadow' :model-value="localDate" range minimal color="primary" :options="optionsFn"
            @update:model-value="handleDatePick">
            <div class="row items-center justify-end">
              <q-btn v-close-popup color="primary" flat>{{ $q.lang.label.close }}</q-btn>
            </div>
          </q-date>
        </div>
      </q-popup-proxy>
    </template>
  </q-input>
</template>

<script lang="ts">

import { useQuasar, date } from 'quasar'
import { computed } from 'vue'
import type { DateRange } from 'src/types/date'


export default {
  emit: ['update:modelValue'],
  props: {
    modelValue: {
      type: Object,
      required: true
    },
    minDate: {
      type: Date
    },
    maxDate: {
      type: Date
    }
  },
  setup(props, { emit }) {
    const $q = useQuasar()

    const localDate = computed(() => {
      if (isNull.value) {
        return null
      }
      if (date.isSameDate(props.modelValue.from, props.modelValue.to)) {
        return date.formatDate(props.modelValue.from, 'YYYY/MM/DD')
      } else {
        return {
          'from': date.formatDate(props.modelValue.from, 'YYYY/MM/DD'),
          'to': date.formatDate(props.modelValue.to, 'YYYY/MM/DD')
        }
      }
    })

    const isNull = computed(() => {
      return props.modelValue.from === null && props.modelValue.to === null
    })

    const formatedDateRange = computed(() => {
      if (isNull.value) {
        return ''
      }

      const dateFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
      const dateRange = date.isSameDate(props.modelValue.from, props.modelValue.to) ? [props.modelValue.from] : [props.modelValue.from, props.modelValue.to]
      return dateRange.map(item => {
        return item.toLocaleDateString($q.lang.isoName, dateFormatOptions)
      }).join(' - ')
    })

    return {
      date,
      localDate,
      formatedDateRange,
      optionsFn(dateString: string) {
        let result = true
        const date = new Date(dateString)
        if (props.minDate !== undefined) {
          result = result && date >= props.minDate
        }

        if (props.maxDate !== undefined) {
          result = result && date <= props.maxDate
        }

        return result
      },
      handleDatePick(value: string | Array<string> | object | null) {
        const newValue: DateRange = {
          'from': null,
          'to': null
        }

        if (typeof value === 'string') {
          newValue.from = new Date(value)
          newValue.to = new Date(value)
        } else if (
          value &&
          typeof value === 'object' &&
          'from' in value &&
          'to' in value
        ) {
          const val = value as { from: string | Date; to: string | Date }
          newValue.from = new Date(val.from)
          newValue.to = new Date(val.to)
        }
        emit('update:modelValue', newValue)
      }
    }
  }
}

</script>
