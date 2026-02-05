// utils/envelope.js

/**
 * Wraps a successful API-style result into an MCP-compatible tool response.
 *
 * @param {*} data
 *   Arbitrary payload to return to the AI (usually JSON-serializable).
 *
 * @param {Object} [meta={}]
 *   Optional metadata to include in the response (e.g. source, version, requestId).
 *
 * @returns {Object}
 *   MCP tool response containing a `content` array with a single text item.
 */
export const ok = (data, meta = {}) => envelope({ ok: true, data, meta });

/**
 * Wraps a failed API-style result into an MCP-compatible tool response.
 *
 * @param {*} error
 *   Error information to return to the AI (string or structured object).
 *
 * @param {Object} [meta={}]
 *   Optional metadata to include in the response (e.g. source, version, requestId).
 *
 * @returns {Object}
 *   MCP tool response containing a `content` array with a single text item.
 */
export const fail = (error, meta = {}) =>
  envelope({
    ok: false,
    data: null,
    meta,
    error: error instanceof Error ? error.message : String(error),
  });

/**
 * Internal helper that converts a normalized API-style envelope
 * into an MCP-compliant tool response.
 *
 * NOTE:
 * - All MCP tools must return an object with a `content` array.
 * - This function centralizes MCP formatting so tools can return
 *   normal API-shaped data without caring about protocol details.
 *
 * @param {Object} params
 * @param {boolean} params.ok
 *   Indicates whether the operation was successful.
 *
 * @param {*} params.data
 *   Payload data for successful responses.
 *
 * @param {Object} params.meta
 *   Metadata to attach to the response.
 *
 * @param {*} params.error
 *   Error information for failed responses.
 *
 * @returns {Object}
 *   MCP tool response with serialized JSON text content.
 */
const envelope = ({ ok, data, meta, error }) => ({
  content: [
    {
      type: "text",
      text: JSON.stringify(
        {
          ok,
          data,
          meta: { ts: new Date().toISOString(), ...meta },
          error,
        },
        null,
        2,
      ),
    },
  ],
});
