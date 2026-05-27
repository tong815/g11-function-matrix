import { quadraticTopic } from "./topics/quadraticTopic.js";
import { linearTopic } from "./topics/linearTopic.js";
import { exponentialTopic } from "./topics/exponentialTopic.js";

export const topicRegistry = {
  quadratic: quadraticTopic,
  linear: linearTopic,
  exponential: exponentialTopic
};

export const topicOrder = ["quadratic", "linear", "exponential"];
