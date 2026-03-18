import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAdminData } from "@/hooks/useAdminData";
import { AdminSectionHeader } from "../AdminSectionHeader";
import { AdminDataTable, ColumnDef, StatusBadge } from "../AdminDataTable";
import { adminSections } from "../AdminLayout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface NoteSubject {
  id: string;
  name: string;
  item_count: number | null;
  display_order: number | null;
  is_active: boolean | null;
}

interface GeneralListItem {
  id: string;
  list_type: string;
  code: string;
  name: string;
  description: string | null;
  display_order: number | null;
  is_active: boolean;
}

type NotesTasksItem = NoteSubject | GeneralListItem;

const tabToListType: Record<string, string> = {
  "task-types": "task_types",
  "task-statuses": "task_statuses",
  "priorities": "priorities",
};

export function NotesTasksSection() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || "note-subjects";

  const section = adminSections.find((s) => s.id === "notes-tasks");
  const tabs = section?.tabs || [];

  const isNoteSubjectsTab = activeTab === "note-subjects";
  const listType = tabToListType[activeTab];

  const noteSubjectsHook = useAdminData<NoteSubject>({
    table: "admin_note_subjects",
    orderBy: { column: "display_order", ascending: true },
  });

  const listHook = useAdminData<GeneralListItem>({
    table: "admin_general_lists",
    filters: listType ? { list_type: listType } : undefined,
    orderBy: { column: "display_order", ascending: true },
  });

  const { data, isLoading, searchTerm, setSearchTerm, create, update, delete: deleteItem, refetch } = 
    isNoteSubjectsTab ? noteSubjectsHook : listHook;

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<NotesTasksItem | null>(null);

  // Note subject form
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    item_count: 0,
    display_order: 0,
    is_active: true,
  });

  // List form
  const [listForm, setListForm] = useState({
    code: "",
    name: "",
    description: "",
    display_order: 0,
    is_active: true,
  });

  const subjectColumns: ColumnDef<NoteSubject>[] = [
    { header: "Name", accessor: "name", sortable: true },
    { header: "Item Count", accessor: "item_count" },
    { header: "Order", accessor: "display_order" },
    {
      header: "Status",
      accessor: "is_active",
      render: (value) => <StatusBadge isActive={value as boolean} />,
    },
  ];

  const listColumns: ColumnDef<GeneralListItem>[] = [
    { header: "Code", accessor: "code", sortable: true },
    { header: "Name", accessor: "name", sortable: true },
    { header: "Description", accessor: "description" },
    { header: "Order", accessor: "display_order" },
    {
      header: "Status",
      accessor: "is_active",
      render: (value) => <StatusBadge isActive={value as boolean} />,
    },
  ];

  const handleAdd = () => {
    setEditItem(null);
    if (isNoteSubjectsTab) {
      setSubjectForm({
        name: "",
        item_count: 0,
        display_order: data.length + 1,
        is_active: true,
      });
    } else {
      setListForm({
        code: "",
        name: "",
        description: "",
        display_order: data.length + 1,
        is_active: true,
      });
    }
    setShowDialog(true);
  };

  const handleEdit = (item: NotesTasksItem) => {
    setEditItem(item);
    if (isNoteSubjectsTab) {
      const subject = item as NoteSubject;
      setSubjectForm({
        name: subject.name,
        item_count: subject.item_count || 0,
        display_order: subject.display_order || 0,
        is_active: subject.is_active ?? true,
      });
    } else {
      const listItem = item as GeneralListItem;
      setListForm({
        code: listItem.code,
        name: listItem.name,
        description: listItem.description || "",
        display_order: listItem.display_order || 0,
        is_active: listItem.is_active,
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (isNoteSubjectsTab) {
      if (!subjectForm.name.trim()) return;
      if (editItem) {
        await update({ id: editItem.id, ...subjectForm });
      } else {
        await create(subjectForm);
      }
    } else {
      if (!listForm.code.trim() || !listForm.name.trim()) return;
      const payload = {
        ...listForm,
        list_type: listType,
        description: listForm.description || null,
      };
      if (editItem) {
        await update({ id: editItem.id, ...payload });
      } else {
        await create(payload);
      }
    }
    setShowDialog(false);
  };

  const handleDelete = async (item: NotesTasksItem) => {
    await deleteItem(item.id);
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(v) => navigate(`/administration/notes-tasks/${v}`)}
      >
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <AdminSectionHeader
            title={tabs.find((t) => t.id === activeTab)?.label || "Notes & Tasks"}
            itemCount={data.length}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            onAdd={handleAdd}
            onReset={() => refetch()}
          />

          <div className="mt-4">
            {isNoteSubjectsTab ? (
              <AdminDataTable
                data={data as NoteSubject[]}
                columns={subjectColumns}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={isLoading}
              />
            ) : (
              <AdminDataTable
                data={data as GeneralListItem[]}
                columns={listColumns}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Edit Item" : "Add New Item"}
            </DialogTitle>
          </DialogHeader>

          {isNoteSubjectsTab ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={subjectForm.name}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, name: e.target.value })
                  }
                  placeholder="Enter subject name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item_count">Item Count</Label>
                  <Input
                    id="item_count"
                    type="number"
                    value={subjectForm.item_count}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, item_count: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={subjectForm.display_order}
                    onChange={(e) =>
                      setSubjectForm({ ...subjectForm, display_order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={subjectForm.is_active}
                  onCheckedChange={(checked) =>
                    setSubjectForm({ ...subjectForm, is_active: checked })
                  }
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={listForm.code}
                    onChange={(e) =>
                      setListForm({ ...listForm, code: e.target.value })
                    }
                    placeholder="e.g., TSK_001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={listForm.display_order}
                    onChange={(e) =>
                      setListForm({ ...listForm, display_order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={listForm.name}
                  onChange={(e) =>
                    setListForm({ ...listForm, name: e.target.value })
                  }
                  placeholder="Enter name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={listForm.description}
                  onChange={(e) =>
                    setListForm({ ...listForm, description: e.target.value })
                  }
                  placeholder="Enter description"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={listForm.is_active}
                  onCheckedChange={(checked) =>
                    setListForm({ ...listForm, is_active: checked })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editItem ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
