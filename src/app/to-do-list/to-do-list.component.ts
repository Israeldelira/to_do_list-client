import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormTaskComponent } from './components/form-task/form-task.component';
import { CommonModule } from '@angular/common';
import { FormModalService } from './components/form-task/form-modal.service';
import { ITask } from './interfaces/ITask';
import { ToDoListService } from './services/to-do-list.service';
import { Observable, Subscription } from 'rxjs';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-to-do-list',
  standalone: true,
  templateUrl: './to-do-list.component.html',
  styleUrl: './to-do-list.component.css',
  imports: [
    CommonModule,
    FormTaskComponent,
    ToastrModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [],
})
export class ToDoListComponent implements OnInit, OnDestroy {
  public modalSwitch!: boolean;
  public showFormUpdate!: boolean;
  public task$!: Observable<ITask[]>; //Observable para las tareas
  public tasks: ITask[] = []; //Variable para almacenar los datos
  public taskId?: number | null;
  public task?: ITask | null;
  private subscriptions: Subscription[] = [];
  public filterFormTask = this.formBuilder.group({
    isComplete: [null],
    priority: [null],
  });
  @Input() reloadTaskValue!: boolean;
  constructor(
    private formModalService: FormModalService,
    private toDoListService: ToDoListService,
    private toastrService: ToastrService,
    private formBuilder: FormBuilder
  ) {}

  ngOnDestroy(): void {
    //Eliminamos todas las subcripciones para que no se quede ninguna
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  ngOnInit(): void {
    this.task$ = this.toDoListService.getTasks();

    //Añadimos todas las subscripciones para tener un correcto control de ellas en un array
    this.subscriptions.push(
      this.formModalService.$modal.subscribe((valor) => {
        this.modalSwitch = valor;
      }),

      //gestionamos el observable
      this.task$.subscribe({
        next: (data) => {
          this.tasks = data;
        },
        error: (error) => {
          console.warn(error);
          this.toastrService.error(
            'Ocurrio un error al obtener los datos',
            'Error'
          );
        },
      })
    );
  }
  openModal(isUpdate?: boolean, task_id?: number | null, task?: ITask): void {
    this.showFormUpdate = isUpdate ? true : false;
    this.taskId = task_id;
    this.task = task;
    this.modalSwitch = true;
  }
  closeModal() {
    this.modalSwitch = false;
  }
  completeTask(task_id: number, task: ITask) {
    task.isComplete = true;
    this.subscriptions.push(
      this.toDoListService.updateTask(task_id, task).subscribe({
        next: (updatedTask) => {
          if (updatedTask) {
            this.toastrService.success(
              'Tarea actualizada correctamente',
              'Exito'
            );
            this.loadTask();
          }
          //Gestionar errores controlados aqui
        },
        error: (error) => {
          console.error('Error al actualizar la tarea', error);
        },
      })
    );
  }

  deleteTask(taskId: number): void {
    this.subscriptions.push(
      this.toDoListService.deleteTask(taskId).subscribe({
        next: (data) => {
          if (data) {
            this.toastrService.success(
              'Tarea eliminada correctamente',
              'Exito'
            );
            this.loadTask();
          }
        },
        error: (error) => {
          console.warn(error);
          this.toastrService.error(
            'Ocurrio un error al eliminar la tarea',
            'Error'
          );
        },
      })
    );
  }
  getPriorityLabel(priority: number | undefined | null): string {
    switch (priority) {
      case 1:
        return 'Baja';
      case 2:
        return 'Media';
      case 3:
        return 'Alta';
      default:
        return 'Desconocida';
    }
  }
  getPriorityClass(priority: number | undefined | null): string {
    switch (priority) {
      case 1:
        return 'badge bg-success ';
      case 2:
        return 'badge bg-warning';
      case 3:
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  applyFilters(): void {
    const filterPriority = this.filterFormTask.get('priority')?.value as
      | number
      | null;
    const filterStatus = this.filterFormTask.get('isComplete')?.value as
      | boolean
      | null;
    this.toDoListService
      .filterTasks(filterStatus, filterPriority)
      .subscribe((tasks) => {
        this.tasks = tasks;
      });
  }
  reloadTasksEvent($event: boolean) {
    this.reloadTaskValue = $event;
    this.loadTask();
  }

  loadTask(): void {
    this.task$ = this.toDoListService.getTasks();
    this.subscriptions.push(
      this.task$.subscribe({
        next: (data) => {
          this.tasks = data;
        },
        error: (error) => {
          console.warn(error);
          this.toastrService.error(
            'Ocurrio un error al obtener los datos',
            'Error'
          );
        },
      })
    );
  }
  
}
