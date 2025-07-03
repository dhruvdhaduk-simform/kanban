import { useMemo, useState } from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { TaskCard } from '@/components/TaskCard';
import type { Column, Id, Task } from '@/types';
import { TrashIcon } from '@/icons/TrashIcon';
import { PlusIcon } from '@/icons/PlusIcon';

interface ColumnContainerProps {
    column: Column;
    deleteColumn: (id: Id) => void;
    updateColumn: (id: Id, title: string) => void;

    createTask: (columnId: Id) => void;
    deleteTask: (id: Id) => void;
    updateTask: (id: Id, content: string) => void;
    task: Array<Task>;
}

export function ColumnContainer({
    column,
    deleteColumn,
    updateColumn,
    createTask,
    deleteTask,
    updateTask,
    task,
}: ColumnContainerProps) {
    const [editMode, setEditMode] = useState(false);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: 'Column',
            column,
        },
        disabled: editMode,
    });

    const taskId = useMemo(() => {
        return task.map((task) => task.id);
    }, [task]);

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-columnBackgroundColor w-[380px] h-[600px] max-h-[600px] rounded-md flex flex-col ${
                isDragging && 'border-2 border-blue-500'
            }`}
        >
            <div
                {...attributes}
                {...listeners}
                onClick={() => setEditMode(true)}
                className={`bg-mainBackgroundColor text-md h-[60px] rounded-md rounded-b-none p-3 font-bold border-columnBackgroundColor border-4 flex items-center justify-between cursor-grab ${isDragging && 'opacity-30'}`}
            >
                <div className="flex items-center gap-2 cursor-pointer">
                    <div className="flex justify-center items-center bg-columnBackgroundColor px-2 py-1 text-sm rounded-full">
                        {task.length}
                    </div>
                    {!editMode && <p className='p-2 pl-[9px]'>{column.title}</p>}
                    {editMode && (
                        <input
                            className="bg-black focus:border-blue-500 border rounded outline-none px-2"
                            value={column.title}
                            autoFocus
                            onChange={(e) =>
                                updateColumn(column.id, e.target.value)
                            }
                            onBlur={() => setEditMode(false)}
                            onKeyDown={(e) => {
                                if (e.key !== 'Enter') return;
                                setEditMode(false);
                            }}
                        />
                    )}
                </div>
                <button
                    onClick={() => {
                        deleteColumn(column.id);
                    }}
                    className="stroke-gray-500 hover:stroke-white hover:bg-columnBackgroundColor rounded px-1 py-2 cursor-pointer"
                >
                    <TrashIcon />
                </button>
            </div>
            <div
                className={`flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto ${isDragging && 'opacity-30'}`}
            >
                <SortableContext items={taskId}>
                    {task.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                        />
                    ))}
                </SortableContext>
            </div>
            <button
                onClick={() => createTask(column.id)}
                className={`flex gap-2 items-center border-columnBackgroundColor border-2 rounded-md p-4 border-x-columnBackgroundColor hover:bg-mainBackgroundColor hover:text-blue-500 active:bg-black cursor-pointer ${isDragging && 'opacity-30'}`}
            >
                <PlusIcon />
                Add task
            </button>
        </div>
    );
};
