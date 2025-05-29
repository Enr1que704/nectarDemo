<script setup lang="ts">
// 1. Import necessary composition API functions
import { ref, computed, onMounted } from 'vue'

// 2. Define reactive state
const count = ref(0)
const message = ref('Hello Vue 3!')

// 3. Define a computed property
const doubleCount = computed(() => count.value * 2)

// 4. Define methods
const addNumbers = (a: number, b: number): number => {
  return a + b
}

const incrementCount = () => {
  count.value++
}

// 5. Lifecycle hook
onMounted(() => {
  console.log('Component mounted')
})
</script>

<template>
  <div class="greetings">
    <h1 class="green">You Did it!</h1>
    <h3>
      You've successfully launched the skeleton application
    </h3>
    <p>{{ addNumbers(1, 2) }}</p>
    <p>Count: {{ count }}</p>
    <p>Double Count: {{ doubleCount }}</p>
    <button @click="incrementCount">Increment</button>
  </div>
</template>
