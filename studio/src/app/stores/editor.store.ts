import {createStore} from '@stencil/store';

import {BreadcrumbsStep} from '../types/editor/breadcrumbs-step';
import { UndoRedoChange } from "../types/editor/undo-redo";

interface EditorStore {
  step: BreadcrumbsStep;
  style: string | null;
  undo: UndoRedoChange[];
  redo: UndoRedoChange[];
  stack: string | undefined
}

const {state} = createStore<EditorStore>({
  step: BreadcrumbsStep.DECK,
  style: null,
  undo: [],
  redo: [],
  stack: undefined
});

export default {state};
