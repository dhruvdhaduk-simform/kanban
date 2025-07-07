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
    const [tasks, setTasks] = useLocalStorage<Array<Task>>(
        LOCAL_STORAGE_KEYS.TASKS,
        []
    );

    const [dragging, setDragging] = useState<{
        type: 'Column' | 'Task';
        id: Id;
    } | null>(null);
    const [dragOver, setDragOver] = useState<Id | null>(null);

    const createColumn = () => {
        const newColumn: Column = {
            id: generateID(),
            title: '',
        };
        setColumns((prev) => [...prev, newColumn]);
    };

    const deleteColumn = (id: Id) => {
        setColumns((prev) => prev.filter((col) => col.id !== id));
        setTasks((prev) => prev.filter((task) => task.columnId !== id));
    };

    const updateColumn = (id: Id, title: string) => {
        setColumns((prev) =>
            prev.map((col) => (col.id === id ? { ...col, title } : col))
        );
    };

    const createTask = (columnId: Id) => {
        const newTask: Task = {
            id: generateID(),
            columnId,
            content: '',
        };
        setTasks((prev) => [...prev, newTask]);
    };

    const deleteTask = (id: Id) => {
        setTasks((prev) => prev.filter((task) => task.id !== id));
    };

    const updateTask = (id: Id, content: string) => {
        setTasks((prev) =>
            prev.map((task) => (task.id === id ? { ...task, content } : task))
        );
    };

    const onDragStart = (type: 'Column' | 'Task', id: Id) => {
        setDragging({ type, id });
    };

    const onDrop = (targetId: Id) => {
        if (!dragging) return;

        if (dragging.type === 'Task') {
            const taskId = dragging.id;
            const targetTask = tasks.find((task) => task.id === targetId);

            if (targetTask) {
                // Rearranging tasks within the same column
                const targetColumnId = targetTask.columnId;

                setTasks((prevTasks) => {
                    const taskToMove = prevTasks.find(
                        (task) => task.id === taskId
                    );
                    if (!taskToMove) return prevTasks;

                    const newTasks = prevTasks.filter(
                        (task) => task.id !== taskId
                    );
                    const targetIndex = newTasks.findIndex(
                        (task) => task.id === targetId
                    );

                    newTasks.splice(targetIndex, 0, {
                        ...taskToMove,
                        columnId: targetColumnId,
                    });
                    return newTasks;
                });
            } else {
                // Moving task to a different column
                const targetColumnId = targetId;

                setTasks((prevTasks) => {
                    const taskToMove = prevTasks.find(
                        (task) => task.id === taskId
                    );
                    if (!taskToMove) return prevTasks;

                    return prevTasks.map((task) => {
                        if (task.id === taskId) {
                            return { ...task, columnId: targetColumnId };
                        }
                        return task;
                    });
                });
            }
        } else if (dragging.type === 'Column') {
            const columnId = dragging.id;

            setColumns((prevColumns) => {
                const activeIndex = prevColumns.findIndex(
                    (col) => col.id === columnId
                );
                const targetIndex = prevColumns.findIndex(
                    (col) => col.id === targetId
                );

                if (activeIndex === targetIndex) return prevColumns;

                const newColumns = [...prevColumns];
                const [movedColumn] = newColumns.splice(activeIndex, 1);
                newColumns.splice(targetIndex, 0, movedColumn);
                return newColumns;
            });
        }

        setDragging(null);
        setDragOver(null);
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
                            tasks={tasks.filter(
                                (task) => task.columnId === column.id
                            )}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                            onDragStart={onDragStart}
                            onDrop={onDrop}
                            dragging={dragging}
                            setDragOver={setDragOver}
                            dragOver={dragOver}
                        />
                    ))}
                </div>
                <button
                    onClick={createColumn}
                    className="h-[60px] w-[380px] min-w-[380px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-blue-500 hover:ring-2 flex gap-2"
                >
                    <PlusIcon />
                    Add Column
                </button>
            </div>
        </div>
    );
}
