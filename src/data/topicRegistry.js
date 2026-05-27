import { quadraticTopic } from "./topics/quadraticTopic.js";
import { linearTopic } from "./topics/linearTopic.js";

export const topicRegistry = {
  quadratic: quadraticTopic,
  linear: linearTopic
};

export const topicOrder = ["quadratic", "linear"];
