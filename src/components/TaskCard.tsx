import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { Id, Task } from '@/types';
import { TrashIcon } from '@/icons/TrashIcon';

interface TaskCardProps {
    task: Task;
    deleteTask: (id: Id) => void;
    updateTask: (id: Id, content: string) => void;
}

export function TaskCard({ task, deleteTask, updateTask }: TaskCardProps) {
    const [mouseIsOver, setMouseIsOver] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        },
        disabled: editMode,
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    const toggleEditMode = () => {
        setEditMode((prev) => !prev);
        setMouseIsOver(false);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={toggleEditMode}
            onMouseEnter={() => !editMode && setMouseIsOver(true)}
            onMouseLeave={() => !editMode && setMouseIsOver(false)}
            className={`bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-blue-500 cursor-grab relative task ${isDragging && 'opacity-40 border-2 border-blue-500'}`}
        >
            {editMode ? (
                <textarea
                    value={task.content}
                    autoFocus
                    placeholder="Task content here"
                    onBlur={toggleEditMode}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.shiftKey) toggleEditMode();
                    }}
                    onChange={(e) => updateTask(task.id, e.target.value)}
                    className="h-[90%] w-full resize-none border-none rounded bg-transparent text-white focus:outline-none"
                ></textarea>
            ) : (
                <>
                    <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
                        {task.content}
                    </p>
                    {mouseIsOver && (
                        <button
                            onClick={() => deleteTask(task.id)}
                            className="stroke-white absolute right-4 top-1/2 -translate-y-1/2 bg-columnBackgroundColor p-2 rounded cursor-pointer"
                        >
                            <TrashIcon />
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
