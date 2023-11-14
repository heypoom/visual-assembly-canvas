import { map } from "nanostores"

export const $launchpad = map({
  // Is the launchpad ready to receive and send?
  ready: false,
})
