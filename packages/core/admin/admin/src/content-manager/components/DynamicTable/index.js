import React, { useMemo } from 'react';

import { DynamicTable as Table, useStrapiApp } from '@strapi/helper-plugin';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { INJECT_COLUMN_IN_TABLE } from '../../../exposedHooks';
import { useEnterprise } from '../../../hooks/useEnterprise';
import { selectDisplayedHeaders } from '../../pages/ListView/selectors';
import { getTrad } from '../../utils';

import BulkActionsBar from './BulkActionsBar';
import { PublicationState } from './CellContent/PublicationState/PublicationState';
import ConfirmDialogDelete from './ConfirmDialogDelete';
import TableRows from './TableRows';

const REVIEW_WORKFLOW_COLUMNS_CE = null;

const DynamicTable = ({
  canCreate,
  canDelete,
  canPublish,
  contentTypeName,
  action,
  isBulkable,
  isLoading,
  onConfirmDelete,
  onConfirmDeleteAll,
  onConfirmPublishAll,
  onConfirmUnpublishAll,
  layout,
  rows,
}) => {
  const { runHookWaterfall } = useStrapiApp();
  const hasDraftAndPublish = layout.contentType.options?.draftAndPublish ?? false;
  const { formatMessage } = useIntl();
  const displayedHeaders = useSelector(selectDisplayedHeaders);
  const reviewWorkflowColumns = useEnterprise(
    REVIEW_WORKFLOW_COLUMNS_CE,
    async () =>
      (
        await import(
          '../../../../../ee/admin/content-manager/components/DynamicTable/CellContent/ReviewWorkflowsStage/constants'
        )
      ).REVIEW_WORKFLOW_COLUMNS_EE,
    {
      combine(ceColumns, eeColumns) {
        return {
          ...eeColumns,
          metadatas: {
            ...eeColumns.metadatas,
            // `label` is a plain object that we need to translate
            label: formatMessage(eeColumns.metadatas.label),
          },
        };
      },

      // TODO: As soon as the feature was enabled in EE mode, the BE currently does not have a way to send
      // `false` once a user is in CE mode again. We shouldn't have to perform the window.strapi.isEE check here
      // and it is meant to be in interim solution until we find a better one.

      enabled:
        (window.strapi.features.isEnabled(window.strapi.features.REVIEW_WORKFLOWS) &&
          layout.contentType.options?.reviewWorkflows) ??
        false,
    }
  );

  const tableHeaders = useMemo(() => {
    const headers = runHookWaterfall(INJECT_COLUMN_IN_TABLE, {
      displayedHeaders,
      layout,
    });

    const formattedHeaders = headers.displayedHeaders.map((header) => {
      const { fieldSchema, metadatas, name } = header;

      return {
        ...header,
        metadatas: {
          ...metadatas,
          label: formatMessage({
            id: getTrad(`containers.ListPage.table-headers.${name}`),
            defaultMessage: metadatas.label,
          }),
        },
        name: fieldSchema.type === 'relation' ? `${name}.${metadatas.mainField.name}` : name,
      };
    });

    if (hasDraftAndPublish) {
      formattedHeaders.push({
        key: '__published_at_temp_key__',
        name: 'publishedAt',
        fieldSchema: {
          type: 'custom',
        },
        metadatas: {
          label: formatMessage({
            id: getTrad(`containers.ListPage.table-headers.publishedAt`),
            defaultMessage: 'publishedAt',
          }),
          searchable: false,
          sortable: true,
        },
        cellFormatter({ publishedAt }) {
          return <PublicationState isPublished={!!publishedAt} />;
        },
      });
    }

    // This should not exist. Ideally we would use registerHook() similar to what has been done
    // in the i18n plugin. In order to do that review-workflows should have been a plugin. In
    // a future iteration we need to find a better pattern.

    if (reviewWorkflowColumns) {
      formattedHeaders.push(reviewWorkflowColumns);
    }

    return formattedHeaders;
  }, [
    runHookWaterfall,
    displayedHeaders,
    layout,
    hasDraftAndPublish,
    reviewWorkflowColumns,
    formatMessage,
  ]);

  return (
    <Table
      components={{ ConfirmDialogDelete }}
      contentType={contentTypeName}
      action={action}
      isLoading={isLoading}
      headers={tableHeaders}
      onConfirmDelete={onConfirmDelete}
      onOpenDeleteAllModalTrackedEvent="willBulkDeleteEntries"
      rows={rows}
      withBulkActions
      withMainAction={(canDelete || canPublish) && isBulkable}
      renderBulkActionsBar={({ selectedEntries, clearSelectedEntries }) => (
        <BulkActionsBar
          showPublish={canPublish && hasDraftAndPublish}
          showDelete={canDelete}
          onConfirmDeleteAll={onConfirmDeleteAll}
          onConfirmPublishAll={onConfirmPublishAll}
          onConfirmUnpublishAll={onConfirmUnpublishAll}
          selectedEntries={selectedEntries}
          clearSelectedEntries={clearSelectedEntries}
        />
      )}
    >
      <TableRows
        canCreate={canCreate}
        canDelete={canDelete}
        contentType={layout.contentType}
        headers={tableHeaders}
        rows={rows}
        withBulkActions
        withMainAction={canDelete && isBulkable}
      />
    </Table>
  );
};

DynamicTable.defaultProps = {
  action: undefined,
};

DynamicTable.propTypes = {
  canCreate: PropTypes.bool.isRequired,
  canDelete: PropTypes.bool.isRequired,
  canPublish: PropTypes.bool.isRequired,
  contentTypeName: PropTypes.string.isRequired,
  action: PropTypes.node,
  isBulkable: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  layout: PropTypes.exact({
    components: PropTypes.object.isRequired,
    contentType: PropTypes.shape({
      attributes: PropTypes.object.isRequired,
      metadatas: PropTypes.object.isRequired,
      layouts: PropTypes.shape({
        list: PropTypes.array.isRequired,
      }).isRequired,
      options: PropTypes.object.isRequired,
      settings: PropTypes.object.isRequired,
    }).isRequired,
  }).isRequired,
  onConfirmDelete: PropTypes.func.isRequired,
  onConfirmDeleteAll: PropTypes.func.isRequired,
  onConfirmPublishAll: PropTypes.func.isRequired,
  onConfirmUnpublishAll: PropTypes.func.isRequired,
  rows: PropTypes.array.isRequired,
};

export default DynamicTable;
