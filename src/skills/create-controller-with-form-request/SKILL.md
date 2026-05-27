---
name: create-controller-with-form-request
description: Use this skill to add an HTTP endpoint in a nuxt-laravelize project. A Single-Action Controller (invoke method) consumes a FormRequest (Zod validation), resolves a use case from the container, and returns a Resource. Wired via defineLaravelizedHandler.
---

# Controller + Form Request

In nuxt-laravelize, a Nuxt server route is a one-line file delegating to a Controller class. The Controller has a single `invoke()` method.

## Preferred: CLI

```bash
laravelize new:controller <VerbNoun> \
  --context=<c> --module=<m> \
  --use-case=<UseCaseClass>
# example
laravelize new:controller CreateInvoice \
  --context=billing --module=invoicing \
  --use-case=InvoiceCreator
```

Adds the controller, request, response and the Nitro endpoint file.

## Endpoint file (Nitro)

```ts
// server/api/invoices/store.post.ts
import { CreateInvoiceController } from '~/server/controllers/CreateInvoiceController'
import { CreateInvoiceRequest } from '~/server/requests/CreateInvoiceRequest'

export default defineLaravelizedHandler({
  controller: CreateInvoiceController,
  request: CreateInvoiceRequest,
})
```

`defineLaravelizedHandler` is auto-imported by the module. It:
1. validates the request with `request.rules()`,
2. resolves the controller from the container,
3. calls `controller.invoke(event, validatedInput)`,
4. serialises the returned `Resource` to JSON.

## Controller class

```ts
// server/controllers/CreateInvoiceController.ts
import type { H3Event } from 'h3'
import type { InvoiceCreator } from '~/server/contexts/billing/invoicing/application/InvoiceCreator/InvoiceCreator'
import { InvoiceResource } from '~/server/responses/InvoiceResource'
import type { CreateInvoiceInput } from '~/server/requests/CreateInvoiceRequest'

export class CreateInvoiceController {
  constructor(private readonly creator: InvoiceCreator) {}

  async invoke(event: H3Event, input: CreateInvoiceInput): Promise<InvoiceResource> {
    await this.creator.execute({
      id: input.id,
      customerId: input.customerId,
      amount: input.amount,
    })
    return new InvoiceResource(/* lookup or accept from creator */)
  }
}
```

## Form Request

```ts
// server/requests/CreateInvoiceRequest.ts
import { z } from 'zod'
import { FormRequest } from '@luckys_luis/nuxt-laravelize'

export class CreateInvoiceRequest extends FormRequest {
  rules() {
    return z.object({
      id: z.string().uuid(),
      customerId: z.string().uuid(),
      amount: z.number().int().positive(),
    })
  }
}

export type CreateInvoiceInput = z.infer<ReturnType<CreateInvoiceRequest['rules']>>
```

You can return a Valibot schema instead — both implement Standard Schema.

## Rules (lint enforces)

- One controller, one method: `invoke`. The `ddd/controller-single-action` lint catches `index/store/show/update/destroy` style.
- Naming: `{Verb}{Noun}Controller`. Verb is `Find/Create/Update/Delete/List/Show/Send/Cancel/...`. The `ddd/controller-naming` lint catches generic names.
- Controllers live in `server/controllers/` (root, NOT under contexts). They are *adapters* — they translate HTTP into use case input.
- Requests in `server/requests/`, responses in `server/responses/` (these are project conventions; not `dtos/`).

## Wiring (provider)

```ts
this.container.transient(createInvoiceControllerToken, (c) =>
  new CreateInvoiceController(c.resolve(invoiceCreatorToken)),
)
```

The `defineLaravelizedHandler` resolves the controller by its class token automatically (no manual binding needed if you use the provided helper).
