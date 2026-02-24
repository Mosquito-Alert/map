<template>
  <q-input :model-value="formatedDateRange" input-class="cursor-pointer" readonly autogrow borderless label-slot>
    <template v-slot:label>
      {{ $t('date') }}
    </template>
    <template v-slot:after v-if="formatedDateRange">
      <q-btn round outline size='xs' color='grey-6' icon="fa fat fa-xmark"
        @click="handleDatePick(null, 'clear')"></q-btn>
    </template>
    <template v-slot:default>
      <q-popup-proxy transition-show="scale" transition-hide="scale" @show="handleShowDateSelector()">
        <div class="row">
          <div class='column q-py-sm'>
            <q-btn flat @click="handleDatePick({ 'from': new Date(), 'to': new Date() }, 'preset')">
              {{ $t('today') }}
            </q-btn>
            <q-btn flat
              @click="handleDatePick({ 'from': date.startOfDate(new Date(), 'month'), 'to': new Date() }, 'preset')">
              {{ $t('this_month') }}
            </q-btn>
            <q-btn flat
              @click="handleDatePick({ 'from': date.startOfDate(new Date(), 'year'), 'to': new Date() }, 'preset')">
              {{ $t('this_year') }}
            </q-btn>
          </div>
          <q-separator vertical />
          <q-date ref="dateSelectorRef" class='no-shadow' :model-value="localDate" range minimal color="primary"
            :options="optionsFn" :navigation-min-year-month="minYearMonth" :navigation-max-year-month="maxYearMonth"
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
import { ref, computed, watch } from 'vue'
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

    const dateSelectorRef = ref()
    const localDate = ref()

    watch(() => props.modelValue, () => {
      if (props.modelValue.from && props.modelValue.to) {
        if (date.isSameDate(props.modelValue.from, props.modelValue.to, 'days')) {
          localDate.value = date.formatDate(props.modelValue.from, 'YYYY/MM/DD')
        } else {
          localDate.value = {
            'from': date.formatDate(props.modelValue.from, 'YYYY/MM/DD'),
            'to': date.formatDate(props.modelValue.to, 'YYYY/MM/DD')
          }
        }
      } else {
        localDate.value = {
          'from': null,
          'to': null
        }
      }
    }, { immediate: true })

    function handleShowDateSelector() {
      if (localDate.value.to !== null && localDate.value.to !== undefined) {
        const toDate = new Date(localDate.value.to)
        dateSelectorRef.value?.setCalendarTo(toDate.getFullYear(), toDate.getMonth() + 1)
      }
    }

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
      const dateRange = date.isSameDate(props.modelValue.from, props.modelValue.to, 'days') ? [props.modelValue.from] : [props.modelValue.from, props.modelValue.to]
      return dateRange.map(item => {
        return item.toLocaleDateString($q.lang.isoName, dateFormatOptions)
      }).join(' - ')
    })

    return {
      dateSelectorRef,
      date,
      minYearMonth: props.minDate ? date.formatDate(props.minDate, 'YYYY/MM') : undefined,
      maxYearMonth: props.maxDate ? date.formatDate(props.maxDate, 'YYYY/MM') : undefined,
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
      handleShowDateSelector,
      handleDatePick(value: string | Array<string> | object | null, reason: string) {
        const newValue: DateRange = {
          'from': null,
          'to': null
        }

        if (typeof value === 'string') {
          const singleDateValue = new Date(value)
          newValue.from = singleDateValue
          newValue.to = singleDateValue
          localDate.value = singleDateValue
        } else if (
          value &&
          typeof value === 'object' &&
          'from' in value &&
          'to' in value
        ) {
          const val = value as { from: string | Date; to: string | Date }
          newValue.from = new Date(val.from)
          newValue.to = new Date(val.to)
          localDate.value = {
            'from': newValue.from ? date.formatDate(newValue.from, 'YYYY/MM/DD') : null,
            'to': newValue.to ? date.formatDate(newValue.to, 'YYYY/MM/DD') : null
          }
        } else if (!value) {
          localDate.value = undefined
        }

        if (!newValue || reason === 'remove-range') return
        emit('update:modelValue', newValue)
      }
    }
  }
}

</script>
