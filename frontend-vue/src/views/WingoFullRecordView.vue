<template>
  <div class="full-record-page">
    <header class="header">
      <div class="header-left" @click="router.back()">
        <span class="back-icon">‹</span>
      </div>
      <div class="header-title">{{ gameMin }} Minutes Record History</div>
      <div class="header-right"></div>
    </header>

    <div class="content">
      <div class="table-container">
        <table class="record-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Number</th>
              <th>Big/Small</th>
              <th>Color</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in records" :key="row.id">
              <td>{{ row.id }}</td>
              <td :class="['number-cell', row.color?.toLowerCase().replace(' ', '-')]">{{ row.number }}</td>
              <td>{{ row.big ? 'Big' : 'Small' }}</td>
              <td>
                <div class="color-dots">
                  <span v-for="c in parseColors(row.color)" :key="c" :class="['dot', c.toLowerCase()]"></span>
                </div>
              </td>
            </tr>
            <tr v-if="records.length === 0">
              <td colspan="4" style="text-align: center; padding: 20px;">No records found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as wingoApi from '../api/wingo'

const route = useRoute()
const router = useRouter()
const records = ref([])
const gameId = computed(() => route.params.id || '1')
const gameMin = computed(() => gameId.value)

const fetchData = async () => {
  try {
    const res = await wingoApi.getFullRecords(gameId.value)
    if (res.data) records.value = res.data
  } catch (err) {
    console.error(err)
  }
}

const parseColors = (c) => c ? c.split(' ') : []

onMounted(fetchData)
</script>

<style scoped>
.full-record-page {
  background: #f5f5f5;
  min-height: 100vh;
}
.header {
  height: 50px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #eee;
}
.back-icon {
  font-size: 30px;
  color: #666;
  cursor: pointer;
}
.header-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}
.content {
  padding: 10px;
}
.table-container {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.record-table {
  width: 100%;
  border-collapse: collapse;
}
.record-table th {
  background: #f8f8f8;
  padding: 12px 8px;
  font-size: 13px;
  color: #666;
  text-align: center;
}
.record-table td {
  padding: 12px 8px;
  font-size: 13px;
  color: #333;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}
.number-cell {
  font-weight: bold;
  font-size: 15px;
}
.number-cell.green { color: #28c04c; }
.number-cell.red { color: #eb433e; }
.number-cell.violet { color: #9c27b0; }
.number-cell.red-violet { color: #eb433e; }
.number-cell.green-violet { color: #28c04c; }

.color-dots {
  display: flex;
  gap: 4px;
  justify-content: center;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.dot.green { background: #28c04c; }
.dot.red { background: #eb433e; }
.dot.violet { background: #9c27b0; }
</style>
