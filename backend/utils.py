from typing import Any, Dict, List


def filter_by_date_range(records: List[Dict[str, Any]], start_date: int, end_date: int) -> List[Dict[str, Any]]:
    """
    Filter records by date range.

    :param records: List of records to filter
    :param start_date: Start date in epoch format
    :param end_date: End date in epoch format
    :return: List of records that fall within the date range
    """
    return [
        record
        for record in records
        if start_date <= record["originationTime"] <= end_date
    ]

def filter_by_nested_field(records: List[Dict[str, Any]], field: str, value: str) -> List[Dict[str, Any]]:
    """
    Filter records by a nested field within the 'devices' dictionary.

    :param records: List of records to filter
    :param field: Nested field name to filter by
    :param value: Value to filter the nested field by
    :return: List of records that match the nested field value
    """
    return [record for record in records if record["devices"].get(field) == value]

def filter_by_field(records: List[Dict[str, Any]], field: str, value: str) -> List[Dict[str, Any]]:
    """
    Filter records by a top-level field.

    :param records: List of records to filter
    :param field: Field name to filter by
    :param value: Value to filter the field by
    :return: List of records that match the field value
    """
    return [record for record in records if record.get(field) == value]
