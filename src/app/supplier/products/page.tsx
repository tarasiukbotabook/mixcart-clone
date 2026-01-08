"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";
import { AddIcon } from "@/components/Icons";

export default function SupplierProducts() {
  const [showForm, setShowForm] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<"price" | "stock" | null>(null);
  const [editValue, setEditValue] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    image: null as File | null,
  });

  // Get current user
  const currentUser = useQuery(api.auth.getCurrentUser, token ? { token } : "skip");
  const categories = useQuery(api.categories.list, {});
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  
  // Get supplier's products (including inactive)
  const supplierProducts = useQuery(
    api.products.listBySupplier,
    userId ? { supplierId: userId as any } : "skip"
  ) || [];

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (currentUser && token) {
      setUserId(currentUser._id);
    }
  }, [currentUser, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
      });
      
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickEdit = async (productId: string, field: "price" | "stock", value: string) => {
    try {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        toast.error("Введите корректное значение");
        return;
      }

      await updateProduct({
        id: productId as any,
        [field]: numValue,
      });

      toast.success(`${field === "price" ? "Цена" : "Вес"} обновлена!`);
      setEditingId(null);
      setEditingField(null);
      setEditValue("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при обновлении");
    }
  };

  const handleToggleActive = async (productId: string, currentActive: boolean) => {
    try {
      await updateProduct({
        id: productId as any,
        active: !currentActive,
      });

      toast.success(currentActive ? "Товар деактивирован" : "Товар активирован");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при обновлении");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("Ошибка: пользователь не найден");
      return;
    }

    if (!formData.categoryId) {
      toast.error("Выберите категорию");
      return;
    }

    if (!formData.image) {
      toast.error("Загрузите фотографию товара");
      return;
    }

    setLoading(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result as string;

        await createProduct({
          name: formData.name,
          slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
          description: formData.description,
          price: parseFloat(formData.price),
          image: base64Image,
          images: [base64Image],
          categoryId: formData.categoryId as any,
          supplierId: userId as any,
          stock: parseInt(formData.stock),
          tags: ["свежий"],
        });

        toast.success("Товар успешно добавлен!");
        setFormData({
          name: "",
          description: "",
          price: "",
          stock: "",
          categoryId: "",
          image: null,
        });
        setImagePreview(null);
        setShowForm(false);
        setLoading(false);
      };
      reader.readAsDataURL(formData.image);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при добавлении товара");
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Мои товары</h1>
          <p className="text-gray-600 mt-2">Управление вашим каталогом</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
        >
          <AddIcon />
          {showForm ? "Отмена" : "Добавить товар"}
        </button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Добавить новый товар</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Название товара *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: Помидоры свежие"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Категория *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите категорию</option>
                  {categories?.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Описание *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Подробное описание товара"
              />
            </div>

            {/* Pricing and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Цена за кг (сўм) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Количество в наличии (кг) *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Фотография товара *
              </label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {imagePreview && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-300">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {loading ? "Добавление..." : "Добавить товар"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setImagePreview(null);
                }}
                className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Список товаров ({supplierProducts.length})</h2>
        </div>
        <div className="p-6">
          {supplierProducts && supplierProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supplierProducts.map((product: any) => (
                <div key={product._id} className={`border-2 rounded-lg overflow-hidden hover:shadow-lg transition ${product.active ? "border-gray-200" : "border-red-300 bg-red-50"}`}>
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-200 overflow-hidden relative">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {!product.active && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Неактивно</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    
                    {/* Price and Stock with Quick Edit */}
                    <div className="space-y-2 mb-4">
                      {/* Price */}
                      <div className="flex items-center justify-between">
                        {editingId === product._id && editingField === "price" ? (
                          <div className="flex gap-2 flex-1">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              step="0.01"
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              autoFocus
                            />
                            <button
                              onClick={() => handleQuickEdit(product._id, "price", editValue)}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(product._id);
                              setEditingField("price");
                              setEditValue(product.price.toString());
                            }}
                            className="text-lg font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            {product.price} сўм/кг
                          </button>
                        )}
                      </div>

                      {/* Stock */}
                      <div className="flex items-center justify-between">
                        {editingId === product._id && editingField === "stock" ? (
                          <div className="flex gap-2 flex-1">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              step="0.1"
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              autoFocus
                            />
                            <button
                              onClick={() => handleQuickEdit(product._id, "stock", editValue)}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(product._id);
                              setEditingField("stock");
                              setEditValue(product.stock.toString());
                            }}
                            className="text-sm text-gray-600 hover:underline cursor-pointer"
                          >
                            {product.stock} кг в наличии
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Active Toggle */}
                    <button
                      onClick={() => handleToggleActive(product._id, product.active)}
                      className={`w-full py-2 rounded-lg font-medium transition ${
                        product.active
                          ? "bg-green-100 text-green-900 hover:bg-green-200"
                          : "bg-red-100 text-red-900 hover:bg-red-200"
                      }`}
                    >
                      {product.active ? "✓ В наличии" : "✗ Нет в наличии"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Товары будут отображаться здесь после добавления
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
