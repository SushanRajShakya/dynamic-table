import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import React, { useState, useEffect, useRef } from 'react';

import { svgIcon } from '../../../constants';
import { useWriteAccess } from '../../../hooks';
import { SvgIcon } from '../../../assets/svgIcon';
import labels from '../../common/constants/label';
import LoadingView from '../../common/loadingView';
import { UPLOADING_FILE } from '../constants/label';
import docElementUtils from '../../../utils/docElement';
import { notifyError } from '../../../utils/notifications';
import { fileErrors } from '../../../constants/errorMessage';
import titlesServices from '../../../services/titles/titles';
import { missingTitlesClientService } from '../../../services/titles';
import loanDocumentsService from '../../../services/titles/loanDocuments';
import { withClickEventListener } from '../../../hoc/withClickEventListener';
import { TITLES_MISSING_TITLES_WRITE } from '../../../config/rulesConstants';

const GridFileUpload = React.forwardRef((props, ref) => {
  const { data, column, updateRow, selected, setSelected, innerRef } = props;

  const hasWriteAccess = useWriteAccess(TITLES_MISSING_TITLES_WRITE);
  const fileUploadRef = useRef();

  const [file, setFile] = useState();
  const [localDoc, setLocalDoc] = useState();
  const [readOnly, setReadOnly] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isEditable, setIsEditable] = useState(true);

  const customClassNames = classNames({
    selected: selected && isEditable,
    active: !readOnly,
  });

  useEffect(() => {
    if (!selected) {
      setIsActive(false);
      setReadOnly(true);
    }
  }, [selected]);

  useEffect(() => {
    isActive && docElementUtils.manageChildToParentPos(fileUploadRef, innerRef);
  }, [isActive]);

  useEffect(() => {
    column.preventEdit &&
      setIsEditable(column.preventEdit?.dependencies?.some(item => data[item.dataColumn] !== item.value));
  }, [data]);

  return (
    <div className={`${customClassNames} file-upload-wrapper`} ref={ref}>
      <div className="file-name">
        {isEditable ? (
          <>
            {data[column.dataColumn] && (
              <span
                onClick={_openFile(data[column.dataColumn], localDoc, setLocalDoc)}
                title={data[column.displayDataColumn]}>
                {data[column.displayDataColumn]}
              </span>
            )}
            <SvgIcon
              name={svgIcon.FILE_UPLOAD}
              onClick={() => {
                setIsActive(!isActive);
              }}
            />
          </>
        ) : (
          <>
            <span className="static">{column.preventEdit.fallbackLabel}</span>
            <SvgIcon className="info-tip" name={svgIcon.INFO_TIP} title={column.preventEdit.fallbackReason} />
          </>
        )}
      </div>
      {selected && isActive && isEditable && (
        <Dropzone onDrop={attachFile(setFile)} disabled={!hasWriteAccess}>
          {({ getRootProps, getInputProps, isDragActive }) => (
            <section className={`${hasWriteAccess ? '' : 'disabled'}`} ref={fileUploadRef}>
              <div className="file-upload-loader">
                {isUploading && (
                  <div className="loader-wrapper">
                    <span>{UPLOADING_FILE}</span>
                    <LoadingView />
                  </div>
                )}
                <div
                  {...getRootProps()}
                  className={`upload-drop ${isDragActive ? 'drag-over' : ''}
                ${hasWriteAccess ? '' : 'disabled'}`}>
                  <SvgIcon name={file ? svgIcon.FOLDER_FULL : svgIcon.FOLDER_EMPTY} />
                  <input name="files" {...getInputProps()} />
                  <input name="docmanid" {...getInputProps()} hidden />
                  <p className={`drag-drop ${file ? 'has-file' : ''}`}>
                    {file ? labels.FILE_ATTACHED : labels.DRAG_DROP}
                  </p>
                  <span title={file?.name || labels.BROWSE_FILE}>{file?.name || labels.BROWSE_FILE}</span>
                </div>
                <div className="actions">
                  <button className="cancel" onClick={resetFile(setFile, setSelected)}>
                    {labels.CANCEL}
                  </button>
                  <button
                    className="confirm"
                    disabled={!file}
                    onClick={_uploadFile(data, file, setFile, setSelected, setIsUploading, updateRow, column)}>
                    {labels.OK}
                  </button>
                </div>
              </div>
            </section>
          )}
        </Dropzone>
      )}
    </div>
  );
});

const attachFile = setFile => file => {
  if (file?.[0] && missingTitlesClientService.validateFileAttached(file[0])) {
    setFile(file[0]);
  } else {
    notifyError(fileErrors.ERROR_CODE, fileErrors.FAILED_TO_ATTACH_FILE);
  }
};

const resetFile = (setFile, setSelected) => e => {
  e.preventDefault();

  setFile(null);
  setSelected(false);
};

const _uploadFile = (data, file, setFile, setSelected, setIsUploading, updateRow, column) => async e => {
  e.preventDefault();

  setIsUploading(true);

  const result = await titlesServices.uploadDocument({
    file,
    applicationId: data.application_id,
    subDocType: column.dataColumn,
  });

  if (result.id_doc_man) {
    const response = await updateRow(data, column.dataColumn, result.id_doc_man);

    if (!response.error) {
      setFile(null);
      setSelected(false);
    }
  }

  setIsUploading(false);
};

const _openFile = (docmanId, localDoc, setLocalDoc) => async e => {
  e.preventDefault();

  let downloadedDoc = localDoc;

  if (!localDoc) {
    const result = await loanDocumentsService.fetchLoanDocument(docmanId);

    if (!result.error) {
      setLocalDoc(result);
      downloadedDoc = result;
    }
  }

  downloadedDoc && window.open(downloadedDoc);
};

export default withClickEventListener(GridFileUpload);
