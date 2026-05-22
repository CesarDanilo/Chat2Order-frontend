import { useState } from "react"
//Components
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
// Icons
import { Plus, Trash2 } from "lucide-react"
import logo from "../public/icon.png"
//Services
import { OrderService } from "@/services/orders-services"
//Types
import z from "zod"

// Interfaces
interface DrawerOrdersProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface OrderItem {
  productName: string
  quantity: number
  unitPrice: number
}

//schema
const itemSchema = z.object({
  productName: z
    .string()
    .min(1, "O nome do produto é obrigatório"),

  quantity: z
    .number()
    .int("A quantidade deve ser um número inteiro")
    .positive("A quantidade deve ser maior que 0"),

  unitPrice: z
    .number()
    .nonnegative("O preço unitário não pode ser negativo"),

  totalPrice: z
    .number()
    .nonnegative("O total do item não pode ser negativo"),
})

export const orderSchema = z.object({
  customerName: z
    .string()
    .min(1, "O nome do cliente é obrigatório"),

  customerPhone: z
    .string()
    .min(8, "Telefone inválido"),

  address: z
    .string()
    .min(1, "O endereço é obrigatório"),

  paymentMethod: z.enum([
    "PIX",
    "CREDIT_CARD",
    "DEBIT_CARD",
    "CASH",
  ]),

  total: z
    .number()
    .nonnegative("O total não pode ser negativo"),

  source: z
    .string()
    .min(1, "A origem é obrigatória"),

  rawMessage: z
    .string()
    .optional(),

  status: z.enum([
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "CANCELLED",
  ]),

  items: z
    .array(itemSchema)
    .min(1, "O pedido deve conter pelo menos 1 item"),
})

export function DrawerOrders({
  open,
  onOpenChange,
}: DrawerOrdersProps) {

  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [address, setAddress] = useState("")
  const [rawMessage, setRawMessage] = useState("")
  const [status, setStatus] = useState<"pendente" | "concluidos" | "cancelado">("pendente");
  const [paymentMethod, setPaymentMethod] = useState<
    "pix" | "credit_card" | "debit_card" | "cash"
  >("pix")

  const [source, setSource] = useState<
    "whatsapp" | "site" | "app"
  >("whatsapp")

  const [items, setItems] = useState<OrderItem[]>([
    {
      productName: "",
      quantity: 1,
      unitPrice: 0,
    },
  ])

  const addItem = () => {
    setItems([
      ...items,
      {
        productName: "",
        quantity: 1,
        unitPrice: 0,
      },
    ])
  }

  const removeItem = (index: number) => {
    const updated = [...items]

    updated.splice(index, 1)

    setItems(updated)
  }

  const updateItem = (
    index: number,
    field: keyof OrderItem,
    value: string | number,
  ) => {
    const updated = [...items]

    updated[index][field] = value as never

    setItems(updated)
  }

  const total = items.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0,
  )

  async function CreateOrder() {
    try {

      const orderService = new OrderService()

      const data = {
        customerName,
        customerPhone,
        address,
        paymentMethod,
        total,
        source,
        rawMessage,
        status,

        items: items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        })),
      }

      const result = orderSchema.safeParse(data)
      
      if (!result.success) {
        console.log(result.error.format())
      } else {
        console.log("Dados válidos")
      }

      const response = await orderService.create(data)

      console.log(response)

      onOpenChange(false)

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent className="ml-auto h-screen max-w-2xl">

        <DrawerHeader className="border-b">
          <DrawerTitle className="flex justify-start items-center gap-3 px-2 py-2">

            <div className="w-6">
              <img src={logo} alt="logo" />
            </div>

            <div>
              Novo Pedido

              <DrawerDescription className="text-xs">
                Cadastre manualmente um novo pedido.
              </DrawerDescription>

            </div>

          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">

          <div className="space-y-6">

            <Card>

              <h3 className="px-5 text-lg font-semibold">
                Informações do cliente
              </h3>

              <CardContent className="space-y-4 px-5">

                <div className="space-y-2">

                  <Label className="text-sm font-medium">
                    Nome do cliente
                  </Label>

                  <Input
                    placeholder="Ex. João Silva"
                    value={customerName}
                    onChange={(e) =>
                      setCustomerName(e.target.value)
                    }
                  />

                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div className="space-y-2">

                    <Label className="text-sm font-medium">
                      Telefone
                    </Label>

                    <Input
                      placeholder="+55 67 999999999"
                      value={customerPhone}
                      onChange={(e) =>
                        setCustomerPhone(e.target.value)
                      }
                    />

                  </div>

                  <div className="space-y-2">

                    <Label className="text-sm font-medium">
                      Origem
                    </Label>

                    <Select
                      value={source}
                      onValueChange={(value) =>
                        setSource(
                          value as
                          | "whatsapp"
                          | "site"
                          | "app"
                        )
                      }
                    >

                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>

                      <SelectContent>

                        <SelectItem value="whatsapp">
                          WhatsApp
                        </SelectItem>

                        <SelectItem value="site">
                          Site
                        </SelectItem>

                        <SelectItem value="app">
                          App
                        </SelectItem>

                      </SelectContent>

                    </Select>

                  </div>

                </div>

                <div className="space-y-2">

                  <Label className="text-sm font-medium">
                    Endereço
                  </Label>

                  <Textarea
                    placeholder="Rua, número, bairro, cidade"
                    value={address}
                    onChange={(e) =>
                      setAddress(e.target.value)
                    }
                  />

                </div>

              </CardContent>

            </Card>

            <Card>

              <CardContent className="grid grid-cols-2 gap-4">

                <div className="space-y-2">

                  <Label className="text-sm font-medium">
                    Forma pag.
                  </Label>

                  <Select
                    value={paymentMethod}
                    onValueChange={(value) =>
                      setPaymentMethod(
                        value as
                        | "pix"
                        | "credit_card"
                        | "debit_card"
                        | "cash"
                      )
                    }
                  >

                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="pix">
                        PIX
                      </SelectItem>

                      <SelectItem value="credit_card">
                        Cartão
                      </SelectItem>

                      <SelectItem value="debit_card">
                        Débito
                      </SelectItem>

                      <SelectItem value="cash">
                        Dinheiro
                      </SelectItem>

                    </SelectContent>

                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Status
                  </Label>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(
                        value as
                        "pendente" | "concluidos" | "cancelado"
                      )
                    }
                  >

                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="pendente">
                        Pendente
                      </SelectItem>

                      <SelectItem value="concluidos">
                        Concluídos
                      </SelectItem>

                      <SelectItem value="cancelado">
                        Cancelado
                      </SelectItem>

                    </SelectContent>

                  </Select>
                </div>

              </CardContent>

            </Card>

            <Card>

              <CardContent className="space-y-5 p-5">

                <div className="flex items-center justify-between">

                  <h3 className="font-semibold">
                    Itens do Pedido
                  </h3>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addItem}
                  >
                    <Plus className="size-4" />
                    Adicionar item
                  </Button>

                </div>

                <div className="space-y-4">

                  {items.map((item, index) => (

                    <div
                      key={index}
                      className="rounded-lg"
                    >

                      <div className="grid grid-cols-12 gap-3">

                        <div className="col-span-5 space-y-2">

                          <Label className="text-sm font-medium">
                            Produto
                          </Label>

                          <Input
                            placeholder="Pizza Grande"
                            value={item.productName}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "productName",
                                e.target.value,
                              )
                            }
                          />

                        </div>

                        <div className="col-span-2 space-y-2">

                          <Label className="text-sm font-medium">
                            Qtd
                          </Label>

                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "quantity",
                                Number(e.target.value),
                              )
                            }
                            className="text-sm font-medium"
                          />

                        </div>

                        <div className="col-span-3 space-y-2">

                          <Label className="text-sm font-medium">
                            Valor
                          </Label>

                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "unitPrice",
                                Number(e.target.value),
                              )
                            }
                            className="text-sm font-medium"
                          />

                        </div>

                        <div className="col-span-1 flex items-end mr-3">

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="size-4 text-red-500" />
                          </Button>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              </CardContent>

            </Card>

            <Card>

              <CardContent className="space-y-2 p-5">

                <Label>
                  Conversa importada
                </Label>

                <Textarea
                  placeholder="Cole aqui a conversa do cliente..."
                  className="min-h-[180px]"
                  value={rawMessage}
                  onChange={(e) =>
                    setRawMessage(e.target.value)
                  }
                />

              </CardContent>

            </Card>

            <Card>

              <CardContent className="flex items-center justify-between p-5">

                <span className="text-lg font-semibold">
                  Total do Pedido
                </span>

                <span className="text-2xl font-bold">
                  R$ {total.toFixed(2)}
                </span>

              </CardContent>

            </Card>

          </div>

        </div>

        <DrawerFooter className="border-t">

          <Button
            className="w-full"
            onClick={CreateOrder}
          >
            Salvar Pedido
          </Button>

          <DrawerClose asChild>

            <Button variant="outline">
              Cancelar
            </Button>

          </DrawerClose>

        </DrawerFooter>

      </DrawerContent>
    </Drawer>
  )
}