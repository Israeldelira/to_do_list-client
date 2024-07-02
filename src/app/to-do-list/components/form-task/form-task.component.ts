import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormModalService } from './form-modal.service';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToDoListService } from '../../services/to-do-list.service';
import { ITask } from '../../interfaces/ITask';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-form-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './form-task.component.html',
  styleUrl: './form-task.component.css',
})
export class FormTaskComponent implements OnInit, OnDestroy {
  @Input() isUpdate!: boolean;
  @Input() task_id?: number | null;
  @Input() task?: ITask | null;
  @Output() reloadTaskEvent = new EventEmitter<boolean>();

  private subscriptions: Subscription[] = [];
  public taskForm = this.formBuilder.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    priority: [0, [Validators.required]],
    isComplete: [false, [Validators.required]],
  });
  constructor(
    private formModalService: FormModalService,
    private toDoListService: ToDoListService,
    private formBuilder: FormBuilder,
    private toastrService: ToastrService
  ) {}

  ngOnDestroy(): void {
    //Eliminamos todas las subcripciones para que no se quede ninguna
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  ngOnInit(): void {
    if (this.isUpdate && this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        priority: this.task.priority,
        isComplete: this.task.isComplete,
      });
    }
  }

  submitForm() {
    const task: ITask = {
      title: this.taskForm.value.title || null,
      description: this.taskForm.value.description || null,
      isComplete: this.taskForm.value.isComplete || null,
      priority: this.taskForm.value.priority || null,
    };
    //Se maneja el mismo formulario y se ajusta la logica depenidendo del valor de isUpdate
    if (!this.isUpdate) {
      this.subscriptions.push(
        this.toDoListService.createTask(task).subscribe({
          next: (createdTask) => {
            this.toastrService.success(
              'Se guardo la nueva tarea correctamente',
              'Exito'
            );
          },
          error: (error) => {
            console.warn(error);
            this.toastrService.error(
              'Ocurrio un error al registrar la tarea',
              'Error'
            );
          },
          complete: () => {
            this.reloadTaskEvent.emit(true);
            this.closeModal();
            this.taskForm.reset();
          },
        })
      );
    } else {
      this.task_id = this.task_id ? this.task_id : null;

      this.subscriptions.push(
        this.toDoListService.updateTask(this.task_id, task).subscribe({
          next: (createdTask) => {
            if (createdTask) {
              this.toastrService.success(
                'Tarea actualizada correctamente',
                'Exito'
              );
            }
            //Gestionar errores controlados aqui
          },
          error: (error) => {
            console.error('Error al actualizar la tarea', error);
          },
          complete: () => {
            this.reloadTaskEvent.emit(true);
            this.closeModal();
            this.taskForm.reset();

          },
        })
      );
    }
  }
  closeModal() {
    this.formModalService.$modal.emit(false);
  }
}
