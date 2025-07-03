import { useMemo, useState } from 'react';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
} from '@dnd-kit/core';

import { ColumnContainer } from '@/components/ColumnContainer';
import { TaskCard } from '@/components/TaskCard';
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

    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                distance: 3,
            },
        })
    );

    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

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

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'Column') {
            setActiveColumn(event.active.data.current.column);
            return;
        }

        if (event.active.data.current?.type === 'Task') {
            setActiveTask(event.active.data.current.task);
            return;
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        setActiveColumn(null);
        setActiveTask(null);

        const { active, over } = event;

        if (!over) return;

        const isActiveColumn = active.data.current?.type === 'Column';
        const isOverColumn = over.data.current?.type === 'Column';

        if (isActiveColumn && isOverColumn) {
            const activeColumnId = active.id;
            const overColumnId = over.id;

            if (activeColumnId === overColumnId) return;

            setColumns((columns) => {
                const activeColumnIndex = columns.findIndex(
                    (col) => col.id === activeColumnId
                );

                const overColumnIndex = columns.findIndex(
                    (col) => col.id === overColumnId
                );

                return arrayMove(columns, activeColumnIndex, overColumnIndex);
            });
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveATask = active.data.current?.type === 'Task';
        const isOverATask = over.data.current?.type === 'Task';

        if (!isActiveATask) return;

        setTask((task) => {
            const activeIndex = task.findIndex((t) => t.id === activeId);

            if (isOverATask) {
                const overIndex = task.findIndex((t) => t.id === overId);
                task[activeIndex].columnId = task[overIndex].columnId;
                return arrayMove(task, activeIndex, overIndex);
            } else {
                task[activeIndex].columnId = overId;
                return arrayMove(task, activeIndex, activeIndex);
            }
        });
    };

    return (
        <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
            <DndContext
                sensors={sensors}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
            >
                <div className="m-auto flex gap-4">
                    <div className="flex gap-4">
                        <SortableContext items={columnsId}>
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
                                />
                            ))}
                        </SortableContext>
                    </div>
                    <button
                        onClick={() => createColumn()}
                        className="h-[60px] w-[380px] min-w-[380px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-blue-500 hover:ring-2 flex gap-2"
                    >
                        <PlusIcon />
                        Add Column
                    </button>
                </div>
                <DragOverlay>
                    {activeColumn && (
                        <ColumnContainer
                            column={activeColumn}
                            deleteColumn={deleteColumn}
                            updateColumn={updateColumn}
                            createTask={createTask}
                            deleteTask={deleteTask}
                            task={task.filter(
                                (task) => task.columnId === activeColumn.id
                            )}
                            updateTask={updateTask}
                        />
                    )}
                    {activeTask && (
                        <TaskCard
                            task={activeTask}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                        />
                    )}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
