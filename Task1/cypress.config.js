const { defineConfig } = require("cypress");

module.exports = defineConfig({
  video:true,
  videocompression: 32,
  videoUploadOnPasses: true,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
