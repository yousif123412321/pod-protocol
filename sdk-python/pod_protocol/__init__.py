"""
PoD Protocol Python SDK

A comprehensive Python SDK for interacting with the PoD Protocol
(Prompt or Die) AI Agent Communication Protocol on Solana.

Author: PoD Protocol Team
Version: 1.5.0
"""

__version__ = "1.5.0"
__author__ = "PoD Protocol Team"
__email__ = "dev@pod-protocol.com"

from .client import PodComClient
from .types import (
    PROGRAM_ID,
    MessageType,
    MessageStatus,
    ChannelVisibility,
    AGENT_CAPABILITIES,
    PodComError,
    AgentAccount,
    MessageAccount,
    ChannelAccount,
    EscrowAccount,
    CreateAgentOptions,
    UpdateAgentOptions,
    SendMessageOptions,
    CreateChannelOptions,
    DepositEscrowOptions,
    WithdrawEscrowOptions,
    PodComConfig,
)
from .services import (
    AgentService,
    MessageService,
    ChannelService,
    EscrowService,
    AnalyticsService,
    DiscoveryService,
    IPFSService,
    ZKCompressionService,
)
from .utils import (
    find_agent_pda,
    find_message_pda,
    find_channel_pda,
    find_escrow_pda,
    hash_payload,
    verify_payload_hash,
    lamports_to_sol,
    sol_to_lamports,
    is_valid_public_key,
    SecureMemoryManager,
)
from .exceptions import (
    PodProtocolError,
    AgentNotFoundError,
    MessageExpiredError,
    ChannelNotFoundError,
    InsufficientFundsError,
    UnauthorizedError,
)

__all__ = [
    # Core
    "PodComClient",
    "__version__",
    "__author__",
    "__email__",
    
    # Types and constants
    "PROGRAM_ID",
    "MessageType",
    "MessageStatus", 
    "ChannelVisibility",
    "AGENT_CAPABILITIES",
    "PodComError",
    "AgentAccount",
    "MessageAccount",
    "ChannelAccount",
    "EscrowAccount",
    "CreateAgentOptions",
    "UpdateAgentOptions",
    "SendMessageOptions",
    "CreateChannelOptions",
    "DepositEscrowOptions",
    "WithdrawEscrowOptions",
    "PodComConfig",
    
    # Services
    "AgentService",
    "MessageService", 
    "ChannelService",
    "EscrowService",
    "AnalyticsService",
    "DiscoveryService",
    "IPFSService",
    "ZKCompressionService",
    
    # Utilities
    "find_agent_pda",
    "find_message_pda",
    "find_channel_pda",
    "find_escrow_pda",
    "hash_payload",
    "verify_payload_hash",
    "lamports_to_sol",
    "sol_to_lamports",
    "is_valid_public_key",
    "SecureMemoryManager",
    
    # Exceptions
    "PodProtocolError",
    "AgentNotFoundError",
    "MessageExpiredError",
    "ChannelNotFoundError",
    "InsufficientFundsError",
    "UnauthorizedError",
]
