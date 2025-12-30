<template>
  <table class="tickets-table">
    <thead>
      <tr>
        <th v-for="column in columns" :key="column.field">
          {{ column.header }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in data" :key="item.id">
        <td v-for="column in columns" :key="column.field">
          <slot :name="`cell-${column.field}`" :item="item">
            {{ item[column.field] }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  columns: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.tickets-table {
  width: 100%;
  border-collapse: collapse;
}

.tickets-table thead {
  background: #f8f9fa;
}

.tickets-table th {
  padding: 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
}

.tickets-table td {
  padding: 14px 12px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.tickets-table tbody tr:hover {
  background: #f8f9fa;
}
</style>
