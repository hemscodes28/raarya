import { chatOrchestrator } from '../orchestrator/chatOrchestrator.js';

export class ChatController {
  async handleChatRequest(req, res) {
    try {
      const { messages, sessionId } = req.body || {};

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'A non-empty messages array is required.'
        });
      }

      const response = await chatOrchestrator.processChat({
        messages,
        sessionId: sessionId || 'default'
      });

      return res.status(200).json(response);
    } catch (err) {
      console.error('[ChatController] Error processing chat request:', err);
      return res.status(500).json({
        success: false,
        message: "I'm having trouble processing that request right now. Please try again.",
        errorCode: 'CHAT_SERVICE_ERROR'
      });
    }
  }
}

export const chatController = new ChatController();
