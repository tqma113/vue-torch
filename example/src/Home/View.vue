<template>
  <div>test</div>
  <button v-on:click="handleDecrease">-</button>{{count}}<button v-on:click="handleIncrease">+</button>
</template>

<script>
import { store } from './store.ts'
export default {
  data() {
    return {}
  },
  computed: {
    count () {
      return store.state.count
    }
  },
  methods: {
    handleIncrease() {
      store.commit('increment')
    },
    handleDecrease() {
      store.commit('decrement')
    }
  }
}
</script>

<style>

</style>