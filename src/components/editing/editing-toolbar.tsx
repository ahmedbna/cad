'use client';

import React, { useState } from 'react';
import {
  Copy,
  Move,
  RotateCcw,
  CopyPlus,
  FlipHorizontal,
  XCircle,
  Undo,
  Redo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip } from '@/components/ui/tooltip';
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EditingTool, EditingState, EditingPhase } from './constants';
import { Label } from '@/components/ui/label';
import { DrawingTool } from '@/constants';

export const editingToolsData = {
  copy: {
    icon: Copy,
    label: 'Copy',
    shortcut: 'CP',
    description: 'Copy objects to a new location',
    phases: ['select', 'base', 'target'],
  },
  move: {
    icon: Move,
    label: 'Move',
    shortcut: 'M',
    description: 'Move objects to a new location',
    phases: ['select', 'base', 'target'],
  },
  rotate: {
    icon: RotateCcw,
    label: 'Rotate',
    shortcut: 'RO',
    description: 'Rotate objects around a base point',
    phases: ['select', 'base', 'target', 'parameter'],
  },
  offset: {
    icon: CopyPlus,
    label: 'Offset',
    shortcut: 'O',
    description: 'Create parallel copies of lines, arcs, and curves',
    phases: ['parameter', 'select', 'target'],
  },
  mirror: {
    icon: FlipHorizontal,
    label: 'Mirror',
    shortcut: 'MI',
    description: 'Create mirror copies of objects across a line',
    phases: ['select', 'base', 'target'],
  },
};

type Props = {
  editingState: EditingState;
  setEditingState: (state: EditingState) => void;
  setSelectedTool: (tool: DrawingTool) => void;
};

export const EditingToolbar = ({
  editingState,
  setEditingState,
  setSelectedTool,
}: Props) => {
  const [showToolbar, setShowToolbar] = useState(true);

  const handleToolClick = (tool: EditingTool) => {
    setSelectedTool('select');
    setEditingState({
      isActive: true,
      tool,
      basePoint: null,
      selectedIds: [],
      parameters: {},
      phase: editingToolsData[tool].phases[0] as EditingPhase,
    });
  };

  const handleCancel = () => {
    setEditingState({
      isActive: false,
      tool: null,
      basePoint: null,
      selectedIds: [],
      phase: 'select',
      parameters: {},
    });
  };

  const handleParameterChange = (param: any, value: any) => {
    setEditingState({
      ...editingState,
      parameters: {
        ...editingState.parameters,
        [param]: parseFloat(value) || 0,
      },
    });
  };

  const getStatusMessage = () => {
    if (!editingState.isActive || !editingState.tool) return null;

    const tool = editingState.tool;
    const phase = editingState.phase;

    switch (tool) {
      case 'copy':
        return phase === 'select'
          ? 'Select objects to copy'
          : phase === 'base'
            ? 'Specify base point'
            : 'Specify target point';

      case 'move':
        return phase === 'select'
          ? 'Select objects to move'
          : phase === 'base'
            ? 'Specify base point'
            : 'Specify target point';

      case 'rotate':
        return phase === 'select'
          ? 'Select objects to rotate'
          : phase === 'base'
            ? 'Specify base point'
            : phase === 'parameter'
              ? 'Specify rotation angle'
              : 'Specify target point';

      case 'offset':
        return phase === 'parameter'
          ? 'Specify offset distance'
          : phase === 'select'
            ? 'Select object to offset'
            : 'Specify side to offset';

      case 'mirror':
        return phase === 'select'
          ? 'Select objects to mirror'
          : phase === 'base'
            ? 'Specify first point of mirror line'
            : 'Specify second point of mirror line';

      default:
        return 'Select an operation';
    }
  };

  const renderParameterInputs = () => {
    if (!editingState.isActive || !editingState.tool) return null;

    const tool = editingState.tool;

    switch (tool) {
      case 'rotate':
        if (editingState.phase === 'parameter') {
          return (
            <div className='flex items-center gap-2'>
              <Label className='text-sm'>Angle (degrees):</Label>
              <Input
                type='number'
                className='w-24'
                value={editingState.parameters.angle || ''}
                onChange={(e) => handleParameterChange('angle', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingState({
                      ...editingState,
                      phase: 'target',
                    });
                  }
                }}
              />
            </div>
          );
        }
        return null;

      case 'offset':
        if (editingState.phase === 'parameter') {
          return (
            <div className='flex items-center gap-2'>
              <Label className='text-sm'>Distance:</Label>
              <Input
                type='number'
                className='w-24'
                value={editingState.parameters.distance || ''}
                onChange={(e) =>
                  handleParameterChange('distance', e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditingState({
                      ...editingState,
                      phase: 'select',
                    });
                  }
                }}
              />
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <div className='flex flex-col w-full'>
      <div className='py-2 rounded-t-md flex items-center justify-between'>
        <h3 className='text-sm font-medium'>Editing Tools</h3>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setShowToolbar(!showToolbar)}
          className='h-6 w-6 p-0'
        >
          {showToolbar ? '-' : '+'}
        </Button>
      </div>

      {showToolbar && (
        <>
          <div className='grid grid-cols-5 gap-2'>
            <TooltipProvider>
              {Object.entries(editingToolsData).map(([key, data]) => {
                const Icon = data.icon;
                const isActive = editingState.tool === key;

                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <Button
                        size='sm'
                        variant={isActive ? 'default' : 'outline'}
                        onClick={() => handleToolClick(key as EditingTool)}
                        className='flex flex-col items-center justify-center h-12'
                      >
                        <Icon className='h-4 w-4' />
                        <span className='text-[10px]'>{data.label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {data.label} ({data.shortcut})
                      </p>
                      <p className='text-xs text-gray-500'>
                        {data.description}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </div>

          <div className='py-3'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <p className='text-sm font-medium mb-1'>{getStatusMessage()}</p>
                {renderParameterInputs()}
              </div>

              {editingState.isActive && (
                <Button variant='destructive' size='sm' onClick={handleCancel}>
                  <XCircle className='h-4 w-4' />
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
