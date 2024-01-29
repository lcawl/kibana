# OpenAPI (Experimental)

The current self-contained spec file is `bundled.json` or `bundled.yaml` and can be used for online tools like those found at <https://openapi.tools/>.
This spec is experimental and may be incomplete or change later.

A guide about the openApi specification can be found at [https://swagger.io/docs/specification/about/](https://swagger.io/docs/specification/about/).

## The `openapi` folder

* `entrypoint.yaml` is the overview file which pulls together all the paths and components.
* [Paths](paths/README.md): this defines each endpoint.  A path can have one operation per http method.

## Tools

To validate and bundle the docs, you can use [Redocly](https://redocly.com/docs/cli/) and [Swagger/OpenAPI CLI](https://www.npmjs.com/package/swagger-cli).

For example, run the following commands in this folder:

  ```bash
  npx @redocly/cli join docs/oas/kibana-info.yaml x-pack/plugins/alerting/docs/openapi/bundled.yaml x-pack/plugins/actions/docs/openapi/bundled.yaml x-pack/plugins/cases/docs/openapi/bundled.yaml x-pack/plugins/ml/common/openapi/ml_apis.yaml -o docs/oas/kibana-openapi.yaml --prefix-components-with-info-prop title
  npx swagger-cli validate docs/oas/kibana-openapi.yaml
  npx @redocly/cli lint docs/oas/kibana-openapi.yaml
  ```

  For the serverless specifications, run the following commands:

 ```bash
  npx @redocly/cli join docs/oas/kibana-info-serverless.yaml x-pack/plugins/actions/docs/openapi/bundled_serverless.yaml packages/core/saved-objects/docs/openapi/bundled.yaml src/plugins/data_views/docs/openapi/bundled.yaml x-pack/plugins/ml/common/openapi/ml_apis_serverless.yaml -o docs/oas/kibana-openapi-serverless.yaml --prefix-components-with-info-prop title
  npx swagger-cli validate docs/oas/kibana-openapi-serverless.yaml
  npx @redocly/cli lint docs/oas/kibana-openapi-serverless.yaml
  ```