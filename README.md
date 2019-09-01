# heimdall

**Implicit** OpenID Connect (OIDC) and OAuth 2.0 Provider with opinionated identity management.

`heimdall` is heavily focused on providing authentication and authorization mechanism to **SPA**s by generating `id_token` and `access_token` via implicit flow.

## Roadmap

There are some missing functionality that should be implemented before *v1.0*.

- [x] Split handlers into multiple classes (or files)
- [x] Decision about custom `scopes` and `claims`
- [x] Implement todos written in comments
- [ ] Extract account management code
- [ ] Use `mongodb` as the datastore
- [ ] Decision about configurable parameters
- [ ] Pass configuration from `YAML` files
- [ ] Create sample app repository
- [ ] Add proper documentation and explain the decisions made (e.g. why there is no consent)
