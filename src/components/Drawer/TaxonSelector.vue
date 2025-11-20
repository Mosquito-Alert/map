<template>
  <CardDrawer>
    <template #title> Selecciona especie de mosquito </template>
    <template #content>
      <ToggleButton
        v-for="taxon in taxaStore.relevantTaxa"
        :key="taxon.id"
        :onLabel="taxon.name"
        :offLabel="taxon.name"
        :modelValue="taxaStore.taxonSelected?.id === taxon.id"
        @update:modelValue="(value) => (taxaStore.taxonSelected = value ? taxon : null)"
        size="small"
        class="italic bg-gray-200 mx-1 my-1 rounded-xl text-gray-700"
      >
      </ToggleButton>
      <TreeSelect
        class="mx-1 my-1"
        :modelValue="taxaStore.taxonSelected?.id"
        @update:modelValue="selectTaxonFromTree"
        :options="nodes"
        :loading="loading"
        :expandedKeys="collectExpandedKeys(taxonTreeNode!)"
        filter
        placeholder="Otra especie..."
      />
    </template>
  </CardDrawer>
</template>
<script lang="ts" setup>
import type { Taxon, TaxonTreeNode } from 'mosquito-alert'
import type { TreeExpandedKeys } from 'primevue'
import ToggleButton from 'primevue/togglebutton'
import type { TreeNode } from 'primevue/treenode'
import TreeSelect from 'primevue/treeselect'
import { computed, onMounted, ref } from 'vue'

import { useTaxaStore } from '../../stores/taxaStore'
import CardDrawer from './CardDrawer.vue'

const loading = ref<boolean>(false)
const taxonTreeNode = ref<TaxonTreeNode>()

const taxaStore = useTaxaStore()

const nodes = computed<TreeNode[]>(() => {
  if (!taxonTreeNode.value) return [] as TreeNode[]
  return [convertTaxonTreeNodeToTreeNode(taxonTreeNode.value)]
})

onMounted(async () => {
  await fetchTaxaTree()
})

const fetchTaxaTree = async () => {
  if (!taxaStore.taxaTree) {
    loading.value = true
    await taxaStore.fetchCulicidaeTaxaTree()
    loading.value = false
  }
  taxonTreeNode.value = taxaStore.taxaTree as TaxonTreeNode
}

const selectTaxonFromTree = (value: Record<number, boolean> | null) => {
  if (!value) {
    taxaStore.taxonSelected = null
    return
  }

  const taxonId = Object.keys(value)[0]
  if (!taxonId) {
    taxaStore.taxonSelected = null
    return
  }
  const node = findNodeByKey(nodes.value, taxonId.toString())
  if (node && node.data) {
    taxaStore.taxonSelected = node.data as Taxon
  } else {
    taxaStore.taxonSelected = null
  }
}

const convertTaxonTreeNodeToTreeNode = (taxonNode: TaxonTreeNode): TreeNode => {
  return {
    key: taxonNode.id.toString(),
    label: taxonNode.name,
    data: <Taxon>{
      id: taxonNode.id,
      name: taxonNode.name,
      italicize: taxonNode.italicize,
    },
    children:
      taxonNode.children.length > 0
        ? taxonNode.children.map(convertTaxonTreeNodeToTreeNode)
        : undefined, // Recursively convert children
    selectable: true, // Set this to true or based on any condition
    leaf: taxonNode.children.length === 0, // If no children, it's a leaf
    styleClass: taxonNode.italicize ? 'italic' : '', // Optionally apply a style class based on `italicize`
  }
}

const collectExpandedKeys = (node: TaxonTreeNode): TreeExpandedKeys => {
  const keys: TreeExpandedKeys = {}
  if (!node) return {}
  if (node.children.length > 0) {
    keys[node.id.toString()] = true
    for (const child of node.children) {
      Object.assign(keys, collectExpandedKeys(child))
    }
  }
  return keys
}

const findNodeByKey = (nodes: TreeNode[], key: string): TreeNode | undefined => {
  for (const node of nodes) {
    if (node.key === key) {
      return node
    }
    if (node.children) {
      const found = findNodeByKey(node.children, key)
      if (found) {
        return found
      }
    }
  }
  return undefined // Not found
}
</script>
