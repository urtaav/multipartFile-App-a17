import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UploadFileService } from './upload-file.service';
import { FileUploadResponse } from './FileUploadResponse';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, JsonPipe, RouterOutlet, FormsModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  
  public fb: FormBuilder = inject(FormBuilder);
  private uploadService: UploadFileService = inject(UploadFileService);

  public form: FormGroup = new FormGroup({});
  public showSuccessAlert: boolean = false;
  public responseFile!: FileUploadResponse
  public filesCollection: FileUploadResponse[] = [];

  subscription!: Subscription;

  ngOnInit() {
    this.form = this.fb.group({
      file: [null, Validators.required]
    })

    this.getFiles();

    this.subscription = this.uploadService.refresh$.subscribe({
      next: () => {
        this.getFiles();
      }
    });
  }

  private getFiles = () => {
    this.uploadService.getAllFiles().subscribe({
      next: (resp) => {
        console.log(resp);
        this.filesCollection = resp;
      }
    });
  }

  onFileSelect = (event: any) => {
    const file = event?.target?.files?.[0];

    if (file) {
      this.form.get('file')?.setValue(file);
    }
  };



  submitForm = () => {
    console.log("submit", this.form.value);

    const formData = new FormData();

    Object.entries(this.form.controls).forEach(([formControlName, formControl]) => {
      formData.append(formControlName, formControl.value);
    });

    this.uploadService.uploadFileToDb(formData).subscribe({
      next: (resp: FileUploadResponse) => {
        console.log(resp);
        this.responseFile = resp;
        this.showSuccessAlert = true;
        this.form.reset();
      },
      error: (err) => {
        console.error(err);
        this.showSuccessAlert = false;
      },
    });
  };


  getIconPath = (file: FileUploadResponse): string => {
    const isImageType = file.fileType.startsWith('image/');

    if (isImageType) {
      return file.downloadUri;  // Ruta de la imagen para tipos de imagen
    }

    const iconPaths: any = {
      'application/pdf': 'https://www.pngkey.com/png/detail/196-1963105_pdf-download-icon-png-clipart-computer-icons-clip.png',
      'application/msword': 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Microsoft_Word_2013-2019_Icon.png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'https://www.iconpacks.net/icons/2/free-zip-icon-1519-thumb.png',
      'application/vnd.ms-excel': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/310px-Placeholder_view_vector.svg.png',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/310px-Placeholder_view_vector.svg.png',
      default: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/310px-Placeholder_view_vector.svg.png'
    };

    return iconPaths[file.fileType.toLowerCase()] || iconPaths.default;
  };

  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
  }
}
