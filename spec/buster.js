var config = exports
  ;

config["Converter"] = {
    environment: "browser"
  , sources: [
      "../vendor/marked.js"
    , "../src/remark/namespace.js"
    , "../src/remark/converter.js"
    ]
  , tests: [
      "remark/converterSpec.js"
    ]
};

config["Config"] = {
    environment: "browser"
  , sources: [
      "../src/remark/namespace.js"
    , "../src/remark/config.js"
    ]
  , tests: [
      "remark/configSpec.js"
    ]
};
