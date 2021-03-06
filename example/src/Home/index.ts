import { createPage } from '../../../src'
import View from './View.vue'
import { store } from './store'

const About = createPage((history, context) => {
  return [View, store]
})

export default About
