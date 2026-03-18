import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Zap, Upload, FileCheck } from "lucide-react";
import { useClientProducts } from "@/hooks/useClientProducts";
import { toast } from "sonner";

interface Step5Props {
  clientId: string;
  workflowId: string;
  onDataChange: () => void;
}

export const Step5ImplementAgreements = ({ clientId, workflowId, onDataChange }: Step5Props) => {
  const { products, loading } = useClientProducts(clientId);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    onDataChange();
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
    onDataChange();
  };

  const handleSTPImplementation = () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select products to implement");
      return;
    }
    toast.success(`Straight-through processing initiated for ${selectedProducts.length} products`);
  };

  const handleManualImplementation = () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select products to implement");
      return;
    }
    toast.info("Manual implementation forms generated");
  };

  const handleUploadDocuments = () => {
    toast.info("Document upload dialog opening...");
  };

  // Mock implementation statuses
  const getProductStatus = (productId: string) => {
    const statuses = ["Pending", "In Progress", "Submitted", "Completed"];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Completed": return "default";
      case "Submitted": return "secondary";
      case "In Progress": return "outline";
      default: return "outline";
    }
  };

  const filteredProducts = products.filter(p => {
    if (filter === "all") return true;
    if (filter === "selected") return selectedProducts.includes(p.id);
    if (filter === "pending") return getProductStatus(p.id) === "Pending";
    if (filter === "completed") return getProductStatus(p.id) === "Completed";
    return true;
  });

  const completedCount = products.filter(p => getProductStatus(p.id) === "Completed").length;
  const progressPercent = products.length > 0 ? (completedCount / products.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Implementation Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Implementation Progress</CardTitle>
            <span className="text-sm text-muted-foreground">
              {completedCount} of {products.length} products implemented
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Product Implementation Table */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Product Implementation</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="selected">Selected</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground">No products to implement</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(product => {
                  const status = getProductStatus(product.id);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => handleSelectProduct(product.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.product}</TableCell>
                      <TableCell>{product.adviser || "N/A"}</TableCell>
                      <TableCell>{product.category || "General"}</TableCell>
                      <TableCell>{product.premium || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <Button
              onClick={handleSTPImplementation}
              disabled={selectedProducts.length === 0}
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              Straight Through Implementation
            </Button>
            <Button
              variant="outline"
              onClick={handleManualImplementation}
              disabled={selectedProducts.length === 0}
              className="gap-2"
            >
              <FileCheck className="w-4 h-4" />
              Manual Implementation
            </Button>
            <Button variant="outline" onClick={handleUploadDocuments} className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Signed Documents
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Outstanding Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span className="text-sm">Client signature on Investment Policy</span>
              <Badge variant="outline">Awaiting</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span className="text-sm">FICA documentation verification</span>
              <Badge variant="outline">Pending</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span className="text-sm">Bank account verification</span>
              <Badge variant="secondary">Complete</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
