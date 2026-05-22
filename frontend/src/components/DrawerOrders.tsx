import { useEffect, useState } from "react"
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
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

type AlertType = "success" | "error"

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

  source: z.enum([
    "WHATSAPP",
    "SITE",
  ]),

  rawMessage: z
    .string()
    .optional(),

  status: z.enum([
    "PENDENTE",
    "CONCLUIDO",
    "CANCELADO",
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
  const [status, setStatus] = useState<"PENDENTE" | "CONCLUIDO" | "CANCELADO">("PENDENTE");
  const [paymentMethod, setPaymentMethod] = useState<
    "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH"
  >("PIX")


  const [source, setSource] = useState<
    "WHATSAPP" | "SITE"
  >("WHATSAPP")

  const [items, setItems] = useState<OrderItem[]>([
    {
      productName: "",
      quantity: 1,
      unitPrice: 0,
    },
  ])

  const [alert, setAlert] = useState<{
    show: boolean
    type: AlertType
    message: string
  }>({
    show: false,
    type: "success",
    message: "",
  })

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

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert((prev) => ({
          ...prev,
          show: false,
        }))
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [alert.show])

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

        setAlert({
          show: true,
          type: "error",
          message:
            "Verifique os campos do formulário.",
        })
        return
      }

      await orderService.create(data)

      setAlert({
        show: true,
        type: "success",
        message:
          "Pedido criado com sucesso.",
      })

      onOpenChange(false)

    } catch (error) {
      setAlert({
        show: true,
        type: "error",
        message:
          "Não foi possível criar o pedido.",
      })
    }
  }

  return (
    <Drawer
      direction="right"
      open={open}
      onOpenChange={onOpenChange}
    >
      {alert.show && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5">
          <Alert
            className={`
              w-[350px]
              shadow-lg
              border
              ${alert.type === "success"
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
              }
            `}
          >

            <AlertTitle>
              {alert.type === "success"
                ? "Pedido criado!"
                : "Erro ao criar pedido"}
            </AlertTitle>

            <AlertDescription>
              {alert.message}
            </AlertDescription>

          </Alert>
        </div>

      )}
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
                          "WHATSAPP" | "SITE"
                        )
                      }
                    >

                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>

                      <SelectContent>

                        <SelectItem value="WHATSAPP">
                          WhatsApp
                        </SelectItem>

                        <SelectItem value="SITE">
                          Site
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
                        "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH"
                      )
                    }
                  >

                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="PIX">
                        PIX
                      </SelectItem>

                      <SelectItem value="CREDIT_CARD">
                        Cartão
                      </SelectItem>

                      <SelectItem value="DEBIT_CARD">
                        Débito
                      </SelectItem>

                      <SelectItem value="CASH">
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
                        "PENDENTE" | "CONCLUIDO" | "CANCELADO"
                      )
                    }
                  >

                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="PENDENTE">
                        Pendente
                      </SelectItem>

                      <SelectItem value="CONCLUIDO">
                        Concluídos
                      </SelectItem>

                      <SelectItem value="CANCELADO">
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

                        <div className="col-span-3 space-y-2">

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