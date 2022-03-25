const morse = require("morse-decoder")
const functions = require("../functions")

module.exports = {
    name: "morse",
    description: "Encodes <text> or decodes <morse>.",
    usage: "<encode/decode> <text/morse>",
    aliases: [],
    file: __filename,
    example: `${functions.configJSON.prefix}morse encode test
    ${functions.configJSON.prefix}morse decode - . ... -`,
    async execute(client, message, args, argsArray) {
        if (argsArray[0] && argsArray[1]) {
            const decodeOrEncode = argsArray.shift().toLowerCase()
            if (decodeOrEncode === "decode" || decodeOrEncode === "encode") {
                const input = argsArray.join(" ")
                let output
                if (decodeOrEncode === "decode")
                    output = morse.decode(input)
                if (decodeOrEncode === "encode")
                    output = morse.encode(input)

                message.reply(`**Input**: ${decodeOrEncode === "encode" ? "Encode" : "Decode"}

                **Input**: ${input}

                **Output**: ${output}`)
            } else {
                message.reply(`Invalid type.

                **Usage**: ${functions.configJSON.prefix}morse <encode/decode> <text/morse>

                **Example**: ${functions.configJSON.prefix}morse encode test
                ${functions.configJSON.prefix}morse decode - . ... -`)
            }
        } else {
            message.reply(`You need at least 2 parameters to use this command.

            **Usage**: ${functions.configJSON.prefix}morse <encode/decode> <text/morse>

            **Example**: ${functions.configJSON.prefix}morse encode test
            ${functions.configJSON.prefix}morse decode - . ... -`)
        }
    }
}