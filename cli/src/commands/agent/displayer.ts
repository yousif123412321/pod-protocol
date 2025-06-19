import { table } from "table";
import { getCapabilityNames } from "@pod-protocol/sdk";
import { getTableConfig } from "../../utils/shared.js";

export class AgentDisplayer {
  public displayAgentInfo(agentData: any): void {
    const data = [
      ["Public Key", agentData.pubkey.toBase58()],
      ["Capabilities", getCapabilityNames(agentData.capabilities).join(", ")],
      ["Reputation", agentData.reputation.toString()],
      ["Metadata URI", agentData.metadataUri],
      ["Last Updated", new Date(agentData.lastUpdated * 1000).toLocaleString()],
    ];

    console.log("\n" + table(data, getTableConfig("Agent Information")));
  }

  public displayAgentsList(agents: any[]): void {
    const data = agents.map((agent: any) => [
      agent.pubkey.toBase58().slice(0, 8) + "...",
      getCapabilityNames(agent.capabilities).join(", "),
      agent.reputation.toString(),
      new Date(agent.lastUpdated * 1000).toLocaleDateString(),
    ]);

    const header = ["Address", "Capabilities", "Reputation", "Last Updated"];
    console.log(
      "\n" + table([header, ...data], getTableConfig("Registered Agents")),
    );
  }
}
