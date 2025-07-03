import { useState } from 'react';
import { ColumnContainer } from '@/components/ColumnContainer';
import type { Column, Id, Task } from '@/types';
import { PlusIcon } from '@/icons/PlusIcon';
import { generateID } from '@/utils/generateID';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { LOCAL_STORAGE_KEYS } from '@/constants';

export function KanbanBoard() {
    const [columns, setColumns] = useLocalStorage<Array<Column>>(
        LOCAL_STORAGE_KEYS.COLUMNS,
        []
    );
    const [task, setTask] = useLocalStorage<Array<Task>>(
        LOCAL_STORAGE_KEYS.TASKS,
        []
    );

    const [dragging, setDragging] = useState<{
        type: 'Column' | 'Task';
        id: Id;
    } | null>(null);

    const createColumn = () => {
        const columnToAdd: Column = {
            id: generateID(),
            title: `Column ${columns.length + 1}`,
        };

        setColumns([...columns, columnToAdd]);
    };

    const deleteColumn = (id: Id) => {
        const filteredColumn = columns.filter((col) => col.id !== id);
        setColumns(filteredColumn);

        const newTask = task.filter((t) => t.columnId !== id);
        setTask(newTask);
    };

    const updateColumn = (id: Id, title: string) => {
        const newColumn = columns.map((col) => {
            if (col.id !== id) return col;
            return { ...col, title };
        });

        setColumns(newColumn);
    };

    const createTask = (columnId: Id) => {
        const newTask: Task = {
            id: generateID(),
            columnId,
            content: `Task ${task.length + 1}`,
        };

        setTask([...task, newTask]);
    };

    const deleteTask = (id: Id) => {
        const newTasks = task.filter((task) => task.id !== id);
        setTask(newTasks);
    };

    const updateTask = (id: Id, content: string) => {
        const newTask = task.map((task) => {
            if (task.id !== id) return task;
            return { ...task, content };
        });
        setTask(newTask);
    };

    const onDragStart = (type: 'Column' | 'Task', id: Id) => {
        setDragging({ type, id });
    };

    const onDragEnd = () => {
        setDragging(null);
    };

    const onDrop = (columnId: Id) => {
        if (!dragging) return;

        if (dragging.type === 'Task') {
            const taskId = dragging.id;
            setTask((prevTasks) => {
                const taskToMove = prevTasks.find((t) => t.id === taskId);
                if (!taskToMove) return prevTasks;

                return prevTasks.map((t) => {
                    if (t.id === taskId) {
                        return { ...t, columnId };
                    }
                    return t;
                });
            });
        } else if (dragging.type === 'Column') {
            const columnId = dragging.id;
            setColumns((prevColumns) => {
                const activeColumnIndex = prevColumns.findIndex(
                    (col) => col.id === columnId
                );
                const overColumnIndex = prevColumns.findIndex(
                    (col) => col.id === columnId
                );
                if (activeColumnIndex === overColumnIndex) return prevColumns;

                const newColumns = [...prevColumns];
                const [movedColumn] = newColumns.splice(activeColumnIndex, 1);
                newColumns.splice(overColumnIndex, 0, movedColumn);
                return newColumns;
            });
        }

        onDragEnd();
    };

    return (
        <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
            <div className="m-auto flex gap-4">
                <div className="flex gap-4">
                    {columns.map((column) => (
                        <ColumnContainer
                            key={column.id}
                            column={column}
                            deleteColumn={deleteColumn}
                            updateColumn={updateColumn}
                            createTask={createTask}
                            task={task.filter(
                                (task) => task.columnId === column.id
                            )}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                            onDragStart={onDragStart}
                            onDrop={onDrop}
                            dragging={dragging}
                        />
                    ))}
                </div>
                <button
                    onClick={() => createColumn()}
                    className="h-[60px] w-[380px] min-w-[380px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-blue-500 hover:ring-2 flex gap-2"
                >
                    <PlusIcon />
                    Add Column
                </button>
            </div>
        </div>
    );
}
