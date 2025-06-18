import {
  validateChannelName,
  validateEnum,
  validatePositiveInteger,
  validateMessage,
} from "../../utils/validation.js";
import { ChannelData } from "./types.js";

export class ChannelValidators {
  static validateChannelData(data: ChannelData): void {
    validateChannelName(data.name);
    validateEnum(data.visibility, ["public", "private"], "visibility");
    validatePositiveInteger(data.maxParticipants);
    validatePositiveInteger(data.feePerMessage);
  }

  static validateMessage(message: string): void {
    validateMessage(message);
  }

  static parseMessageType(type: string): string {
    const typeMap: { [key: string]: string } = {
      text: "Text",
      data: "Data",
      command: "Command",
      response: "Response",
    };
    return typeMap[type.toLowerCase()] || "Text";
  }
}
