import {
  help,
  icon,
  inner,
  label,
  message,
  messages,
  outer,
  prefix,
  suffix,
  textInput,
  wrapper,
} from '@formkit/inputs'
/**
 * Input definition for a text.
 * @public
 */
export const text = {
  schema: outer(
    wrapper(
      /*
       * Here we are commenting out the label input and moving it below the
       * text input.
       * label('$label'),
       */
      inner(
        icon('prefix', 'label'),
        prefix(),
        textInput('prefix'),
        /*
         * New label placemenet
         */

        label('$label'),

        suffix(),
        icon('suffix'),
      ),
    ),
    help('$help'),
    messages(message('$message.value')),
  ),
  /**
   * The type of node, can be a list, group, or input.
   */
  type: 'input',
  /**
   * An array of extra props to accept for this input.
   */
  props: [],
  /**
   * Additional features that should be added to your input
   */
  features: [],
}
