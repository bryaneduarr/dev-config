/** Global key of the function Pi calls to draw a user or agent message card; the patch that installs it must use the same key. */
export const MESSAGE_CARD_RENDERER_KEY = "pi.harness.renderMessageCard";
/** Global key of the function the powerline editor calls to draw the input card; the patch that installs it must use the same key. */
export const INPUT_CARD_RENDERER_KEY = "pi.harness.renderInputCard";
/** Global key of the function Pi calls to ask whether an agent reply is only progress narration; the patch that calls it must use the same key. */
export const INTERMEDIATE_REPLY_CHECK_KEY = "pi.harness.isIntermediateReply";
