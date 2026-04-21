import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import type { Product } from "../types";

type ProductManagerProps = {
  products: Product[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Product>) => void;
};

export function ProductManager({ products, onAdd, onRemove, onUpdate }: ProductManagerProps) {
  return (
    <Card title="Produtos Adicionais" className="panel-card">
      <div className="stack">
        {products.map((product) => (
          <div key={product.id} className="line-grid line-grid--products">
            <div className="field">
              <label htmlFor={`prod-nome-${product.id}`}>Nome do produto</label>
              <InputText
                id={`prod-nome-${product.id}`}
                value={product.name}
                onChange={(event) => onUpdate(product.id, { name: event.target.value })}
                placeholder="Ex.: Add-on, outro plano"
              />
            </div>
            <div className="field">
              <label htmlFor={`prod-preco-${product.id}`}>Preço unitário (mensal)</label>
              <InputNumber
                inputId={`prod-preco-${product.id}`}
                value={product.price}
                onValueChange={(event) => onUpdate(product.id, { price: event.value ?? 0 })}
                mode="currency"
                currency="BRL"
                locale="pt-BR"
              />
            </div>
            <div className="field">
              <label htmlFor={`prod-clientes-${product.id}`}>Quantidade de clientes</label>
              <span className="field-hint">Assinantes deste produto</span>
              <InputNumber
                inputId={`prod-clientes-${product.id}`}
                value={product.clients}
                onValueChange={(event) => onUpdate(product.id, { clients: event.value ?? 0 })}
                min={0}
              />
            </div>
            <div className="field">
              <label className="line-grid-action-label">Ação</label>
              <Button
                icon="pi pi-trash"
                severity="danger"
                outlined
                onClick={() => onRemove(product.id)}
                aria-label={`Remover produto ${product.name}`}
              />
            </div>
          </div>
        ))}
        <Button label="Adicionar Produto" icon="pi pi-plus" onClick={onAdd} />
      </div>
    </Card>
  );
}
