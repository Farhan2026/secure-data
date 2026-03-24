const { buildAnalysisResponse } = require("../utils/analyzer");
const { cleanText, normalizeBoolean, parseOptions } = require("../utils/validators");

function analyzeInput(req, res) {
  try {
    let inputType = "text";
    let content = "";
    let options = {
      mask: true,
      log_analysis: true,
    };

    if (req.file) {
      inputType = "file";
      content = req.file.buffer.toString("utf-8");
      options = parseOptions(req.body.options);
    } else {
      inputType = String(req.body.input_type || "text").trim().toLowerCase();
      content = typeof req.body.content === "string" ? req.body.content : "";
      options = {
        mask: normalizeBoolean(req.body?.options?.mask, true),
        log_analysis: normalizeBoolean(req.body?.options?.log_analysis, true),
      };
    }

    const cleanedContent = cleanText(content);

    if (!cleanedContent.trim()) {
      return res.status(400).json({
        error: "Content is required for analysis.",
      });
    }

    if (!["text", "file", "log"].includes(inputType)) {
      return res.status(400).json({
        error: "input_type must be text, file, or log.",
      });
    }

    const result = buildAnalysisResponse({
      inputType,
      content: cleanedContent,
      options,
    });

    return res.json(result);
  } catch (error) {
    return res.status(400).json({
      error: error.message || "Could not analyze input.",
    });
  }
}

module.exports = {
  analyzeInput,
};
