// "use client"
// import { Card } from "@/components/ui/card"
// import { Dialog, DialogContent } from "@/components/ui/dialog"

// interface Todo {
//   id: string
//   title: string
//   description?: string
//   status: "PENDING" | "COMPLETED"
//   imagePath?: string
//   dueDate?: Date | string
//   priority: string
//   category?: string
//   isPublic: boolean
//   userId: string
//   createdAt: Date | string
//   updatedAt: Date | string
// }

// interface TodoDetailModalProps {
//   todo: Todo | null
//   isOpen: boolean
//   onClose: () => void
// }

// export function TodoDetailModal({ todo, isOpen, onClose }: TodoDetailModalProps) {
//   if (!todo) return null

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case "high":
//         return "bg-destructive/20 text-destructive"
//       case "medium":
//         return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
//       case "low":
//         return "bg-accent/20 text-accent"
//       default:
//         return "bg-muted text-muted-foreground"
//     }
//   }

//   const formatDate = (dateInput: Date | string | undefined) => {
//     if (!dateInput) return ""
//     const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
//     return date.toLocaleDateString("id-ID", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       weekday: "long",
//     })
//   }

//   const formatTime = (dateInput: Date | string | undefined) => {
//     if (!dateInput) return ""
//     const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
//     return date.toLocaleTimeString("id-ID", {
//       hour: "2-digit",
//       minute: "2-digit",
//     })
//   }

//   const isCompleted = todo.status === "COMPLETED"

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <div className="pr-6">
//           {/* Header */}
//           <div className="flex items-start justify-between mb-6">
//             <div className="flex-1">
//               <h2
//                 className={`text-3xl font-bold ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}
//               >
//                 {todo.title}
//               </h2>
//               <div className="flex items-center gap-2 mt-2">
//                 <span
//                   className={`px-3 py-1 rounded-full text-sm font-medium ${isCompleted ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"}`}
//                 >
//                   {isCompleted ? "Selesai" : "Pending"}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Description */}
//           {todo.description && (
//             <div className="mb-6">
//               <h3 className="text-sm font-semibold text-muted-foreground mb-2">Deskripsi</h3>
//               <Card className="p-4 bg-muted/50 border-border/50">
//                 <p className={`text-sm leading-relaxed ${isCompleted ? "text-muted-foreground" : "text-foreground"}`}>
//                   {todo.description}
//                 </p>
//               </Card>
//             </div>
//           )}

//           {/* Image - Full Size Display */}
//           {todo.imagePath && (
//             <div className="mb-6">
//               <h3 className="text-sm font-semibold text-muted-foreground mb-2">Gambar</h3>
//               <div className="bg-muted rounded-lg overflow-hidden max-h-96">
//                 <img
//                   src={`http://localhost:3000${todo.imagePath}`}
//                   alt={todo.title}
//                   className="w-full h-auto object-contain"
//                 />
//               </div>
//             </div>
//           )}

//           {/* Details Grid */}
//           <div className="grid grid-cols-2 gap-4 mb-6">
//             {/* Priority */}
//             <div>
//               <h3 className="text-xs font-semibold text-muted-foreground mb-2">Prioritas</h3>
//               <span
//                 className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}
//               >
//                 {todo.priority === "high" ? "Tinggi" : todo.priority === "medium" ? "Sedang" : "Rendah"}
//               </span>
//             </div>

//             {/* Category */}
//             {todo.category && (
//               <div>
//                 <h3 className="text-xs font-semibold text-muted-foreground mb-2">Kategori</h3>
//                 <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
//                   {todo.category}
//                 </span>
//               </div>
//             )}

//             {/* Due Date */}
//             {todo.dueDate && (
//               <div>
//                 <h3 className="text-xs font-semibold text-muted-foreground mb-2">Tanggal Jatuh Tempo</h3>
//                 <p className="text-sm text-foreground">{formatDate(todo.dueDate)}</p>
//               </div>
//             )}

//             {/* Visibility */}
//             <div>
//               <h3 className="text-xs font-semibold text-muted-foreground mb-2">Visibilitas</h3>
//               <span
//                 className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${todo.isPublic ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" : "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300"}`}
//               >
//                 {todo.isPublic ? "Publik" : "Pribadi"}
//               </span>
//             </div>
//           </div>

//           {/* Timestamps */}
//           <div className="border-t border-border pt-4">
//             <div className="grid grid-cols-2 gap-4 text-xs">
//               <div>
//                 <h3 className="font-semibold text-muted-foreground mb-1">Dibuat</h3>
//                 <p className="text-foreground">{formatDate(todo.createdAt)}</p>
//                 <p className="text-muted-foreground text-xs">{formatTime(todo.createdAt)}</p>
//               </div>
//               <div>
//                 <h3 className="font-semibold text-muted-foreground mb-1">Diperbarui</h3>
//                 <p className="text-foreground">{formatDate(todo.updatedAt)}</p>
//                 <p className="text-muted-foreground text-xs">{formatTime(todo.updatedAt)}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }
