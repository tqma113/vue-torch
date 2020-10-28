<template>
  <div>test</div>
  <button v-on:click="handleDecrease">-</button>{{count}}<button v-on:click="handleIncrease">+</button>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    handleIncrease() {
      this.count = this.count + 1
    },
    handleDecrease() {
      this.count = this.count - 1
    }
  }
}
</script>

<style>

</style>