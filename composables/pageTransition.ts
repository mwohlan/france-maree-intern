import { TransitionProps } from "vue"

/* @unocss-include */

export const usePageTransition = () => {
  return {
    mode: 'out-in',
    enterActiveClass: 'duration-300',
    leaveActiveClass: 'duration-150',
    enterFromClass: 'opacity-0 translate-x-10%',
    leaveToClass: 'opacity-0 translate-x-10%',
  } as Pick<TransitionProps, 'mode' | 'enterActiveClass' | 'leaveActiveClass' | 'enterFromClass' | 'leaveToClass'>
}
