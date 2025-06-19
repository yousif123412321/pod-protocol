import { table } from "table";
import { getTableConfig, formatValue } from "../../utils/shared.js";

export class MessageDisplayer {
// Define a proper interface for messageData
interface MessageData {
  pubkey: { toBase58(): string };
  sender: { toBase58(): string };
  recipient: { toBase58(): string };
  messageType: string;
  status: string;
  payload: string;
  timestamp: number;
  expiresAt?: number;
}

// ... other imports and code ...

export class MessageDisplayer {
-  public displayMessageInfo(messageData: any): void {
+  public displayMessageInfo(messageData: MessageData): void {
     // existing implementation...
  }

  // other methods...
}
    const data = [
      ["Message ID", formatValue(messageData.pubkey.toBase58(), "address")],
      ["Sender", formatValue(messageData.sender.toBase58(), "address")],
      ["Recipient", formatValue(messageData.recipient.toBase58(), "address")],
      ["Type", formatValue(messageData.messageType, "text")],
      ["Status", formatValue(messageData.status, "text")],
      [
        "Payload",
        formatValue(
          messageData.payload.slice(0, 100) +
            (messageData.payload.length > 100 ? "..." : ""),
          "text",
        ),
      ],
      [
        "Timestamp",
        formatValue(
          new Date(messageData.timestamp * 1000).toLocaleString(),
          "text",
        ),
      ],
      [
        "Expires At",
        formatValue(
          messageData.expiresAt
            ? new Date(messageData.expiresAt * 1000).toLocaleString()
            : "Never",
          "text",
        ),
      ],
    ];

    console.log("\n" + table(data, getTableConfig("Message Information")));
  }

  public displayMessagesList(messages: any[]): void {
    const data = messages.map((msg: any) => [
      formatValue(msg.pubkey.toBase58().slice(0, 8) + "...", "address"),
      formatValue(msg.sender.toBase58().slice(0, 8) + "...", "address"),
      formatValue(msg.recipient.toBase58().slice(0, 8) + "...", "address"),
      formatValue(msg.messageType, "text"),
      formatValue(msg.status, "text"),
      formatValue(new Date(msg.timestamp * 1000).toLocaleDateString(), "text"),
    ]);

    const header = ["ID", "Sender", "Recipient", "Type", "Status", "Date"];
    console.log("\n" + table([header, ...data], getTableConfig("Messages")));
  }
}
